use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::state::Offer;
use crate::errors::SwapError;
use super::transfer_tokens;

#[derive(Accounts)]
pub struct TakeOffer<'info> {
    // User accepting the offer
    #[account(mut)]
    pub taker: Signer<'info>,

    // Maker (original offer creator) – doesn’t sign, just receives tokens
    #[account(mut)]
    pub maker: SystemAccount<'info>,

    // Token A mint (the one maker offered)
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    // Token B mint (the one maker wants in exchange)
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    // Taker’s ATA for Token A (they receive it)
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_a,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    // Taker’s ATA for Token B (they pay with this) → must already exist
    #[account(
        mut,
        associated_token::mint = token_mint_b,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    // Maker’s ATA for Token B (they receive it)
    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_b,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    // The offer PDA that holds trade metadata
    #[account(
        mut,
        close = maker, // send rent back to maker after close
        has_one = maker,
        has_one = token_mint_a,
        has_one = token_mint_b,
        seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    // Vault ATA holding maker’s Token A
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    // Standard programs
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

// Step 1: Transfer taker’s Token B into maker’s account
pub fn send_wanted_tokens_to_maker(ctx: &Context<TakeOffer>) -> Result<()> {
    // Check expiration
    let clock = Clock::get()?;
    require!(
        clock.unix_timestamp <= ctx.accounts.offer.expires_at,
        SwapError::OfferExpired
    );

    transfer_tokens(
        &ctx.accounts.taker_token_account_b,
        &ctx.accounts.maker_token_account_b,
        &ctx.accounts.taker,
        &ctx.accounts.token_mint_b,
        &ctx.accounts.token_program,
        ctx.accounts.offer.token_b_wanted_amount,
        ctx.accounts.token_mint_b.decimals,
    )
}

// Step 2: Withdraw Token A from vault to taker, then close vault
pub fn withdraw_and_close_vault(ctx: Context<TakeOffer>) -> Result<()> {
    let seeds = &[
        b"offer",
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &ctx.accounts.offer.id.to_le_bytes()[..],
        &[ctx.accounts.offer.bump],
    ];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

    // --- Transfer Token A from vault → taker ---
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.taker_token_account_a.to_account_info(),
        mint: ctx.accounts.token_mint_a.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        &signer_seeds,
    );

    transfer_checked(
        transfer_ctx,
        ctx.accounts.offer.token_a_offered_amount,
        ctx.accounts.token_mint_a.decimals,
    )?;

    // --- Close vault and return rent lamports ---
    let close_accounts = CloseAccount {
        account: ctx.accounts.vault.to_account_info(),
        destination: ctx.accounts.maker.to_account_info(), // rent goes back to maker
        authority: ctx.accounts.offer.to_account_info(),
    };

    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_accounts,
        &signer_seeds,
    );

    close_account(close_ctx)
}
