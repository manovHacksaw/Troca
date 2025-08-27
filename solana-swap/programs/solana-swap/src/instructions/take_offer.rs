use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::state::Offer;
use super::transfer_tokens;

#[derive(Accounts)]
pub struct TakeOffer<'info>{
    // User accepting the offer
    #[account(mut)]
    pub taker: Signer<'info>,
    
    // Maker (original offer creator) – doesn't sign here, just receives tokens
    #[account(mut)]
    pub maker: SystemAccount<'info>,

    // Token A mint (the one maker offered)
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    // Token B mint (the one maker wants in exchange)
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    // Taker’s associated token account for Token A
    // - If missing, auto-created and funded by taker
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    // Taker’s associated token account for Token B
    // Must already exist (since taker is paying with this)
    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    // Maker’s associated token account for Token B
    // - If missing, auto-created and funded by taker
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    // The offer PDA that holds metadata about the trade
    #[account(
        mut,
        close = maker, // when offer is done, any lamports left go back to maker
        has_one = maker,
        has_one = token_mint_a,
        has_one = token_mint_b,
        seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    offer: Account<'info, Offer>,

    // The vault ATA holding the maker’s Token A
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    vault: InterfaceAccount<'info, TokenAccount>,

    // Standard programs required
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// Step 1: Transfer taker's Token B into maker's account
pub fn send_wanted_tokens_to_maker<'info>(
    ctx: &Context<TakeOffer>,
) -> Result<()> {
    transfer_tokens(
        &ctx.accounts.taker_token_account_b,        // from = taker pays with Token B
        &ctx.accounts.maker_token_account_b,        // to = maker receives Token B
        &ctx.accounts.taker,                        // authority = taker must sign
        &ctx.accounts.token_mint_b,                 // mint of Token B
        &ctx.accounts.token_program,                // token program
        ctx.accounts.offer.token_b_wanted_amount,   // amount taker pays
        ctx.accounts.token_mint_b.decimals,         // mint decimals
    )
}

// Step 2: Withdraw Token A from vault to taker, then close vault ATA
pub fn withdraw_and_close_vault(context: Context<TakeOffer>) -> Result<()> {
    // Seeds to re-derive the PDA (offer) so it can sign
    let seeds = &[
        b"offer",
        context.accounts.maker.to_account_info().key.as_ref(),
        &context.accounts.offer.id.to_le_bytes()[..],
        &[context.accounts.offer.bump],
    ];
   let signer_seeds: &[&[&[u8]]] = &[seeds];

    // --- TransferChecked: vault -> taker (Token A) ---
    let accounts = TransferChecked {
        from: context.accounts.vault.to_account_info(),              // vault ATA (source)
        to: context.accounts.taker_token_account_a.to_account_info(),// taker ATA (destination)
        mint: context.accounts.token_mint_a.to_account_info(),       // token A mint
        authority: context.accounts.offer.to_account_info(),         // PDA = offer
    };

    let cpi_context = CpiContext::new_with_signer(
        context.accounts.token_program.to_account_info(), // SPL Token program
        accounts,
        &signer_seeds, // prove PDA is authority
    );

    transfer_checked(
        cpi_context,
        context.accounts.vault.amount,        // transfer *all* vault tokens
        context.accounts.token_mint_a.decimals,
    )?;

    // --- CloseAccount: close vault ATA and return rent lamports ---
    let accounts = CloseAccount {
        account: context.accounts.vault.to_account_info(),           // vault ATA
        destination: context.accounts.taker.to_account_info(),       // taker receives rent lamports
        authority: context.accounts.offer.to_account_info(),         // PDA signs
    };

    let cpi_context = CpiContext::new_with_signer(
        context.accounts.token_program.to_account_info(),
        accounts,
        &signer_seeds,
    );

    close_account(cpi_context); // vault closed, rent reclaimed

    Ok(())
}
