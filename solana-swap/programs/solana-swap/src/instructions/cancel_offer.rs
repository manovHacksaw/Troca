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

#[derive(Accounts)]
pub struct CancelOffer<'info> {
    // Maker of the original offer
    #[account(mut)]
    pub maker: Signer<'info>,

    // Token A mint (the one that was offered)
    pub token_mint_a: InterfaceAccount<'info, Mint>,

    // Maker's associated token account for Token A (where tokens will be returned)
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    // The offer PDA that holds metadata about the trade
    #[account(
        mut,
        close = maker, // when offer is cancelled, any remaining lamports go back to maker
        has_one = maker,
        has_one = token_mint_a,
        seeds = [b"offer", maker.key().as_ref(), offer.id.to_le_bytes().as_ref()],
        bump = offer.bump
    )]
    pub offer: Account<'info, Offer>,

    // The vault ATA holding the maker's Token A
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    // Standard programs required
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
    let offer = &ctx.accounts.offer;
    let clock = Clock::get()?;

    // Only maker can cancel before expiry, anyone can cancel after expiry
    if ctx.accounts.maker.key() != offer.maker && clock.unix_timestamp <= offer.expires_at {
        return err!(SwapError::UnauthorizedCancel);
    }

    // Seeds to re-derive the PDA (offer) so it can sign
    let seeds = &[
        b"offer",
        ctx.accounts.maker.to_account_info().key.as_ref(),
        &offer.id.to_le_bytes()[..],
        &[offer.bump],
    ];
    let signer_seeds: &[&[&[u8]]] = &[seeds];

    // Return tokens from vault to maker
    let transfer_accounts = TransferChecked {
        from: ctx.accounts.vault.to_account_info(),
        to: ctx.accounts.maker_token_account_a.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
        mint: ctx.accounts.token_mint_a.to_account_info(),
    };

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        transfer_accounts,
        signer_seeds,
    );

    transfer_checked(
        transfer_ctx,
        offer.token_a_offered_amount,
        ctx.accounts.token_mint_a.decimals,
    )?;

    // Close vault ATA and return rent lamports to maker
    let close_accounts = CloseAccount {
        account: ctx.accounts.vault.to_account_info(),
        destination: ctx.accounts.maker.to_account_info(),
        authority: ctx.accounts.offer.to_account_info(),
    };

    let close_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        close_accounts,
        signer_seeds,
    );

    close_account(close_ctx)?;

    Ok(())
}
