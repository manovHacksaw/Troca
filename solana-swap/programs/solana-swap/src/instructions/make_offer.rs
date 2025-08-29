use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

use crate::constants::ANCHOR_DISCRIMINATOR;
use crate::state::Offer;
use crate::errors::SwapError;
use super::transfer_tokens;

#[derive(Accounts)]
#[instruction(id: u64, token_a_offered_amount: u64, token_b_wanted_amount: u64, expires_at: i64)]
pub struct MakeOffer<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    // Both token mints (interface accounts for mint)
    pub token_mint_a: InterfaceAccount<'info, Mint>,
    pub token_mint_b: InterfaceAccount<'info, Mint>,

    // Maker’s ATA for token A
    #[account(
        mut,
        associated_token::mint = token_mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_token_account_a: InterfaceAccount<'info, TokenAccount>,

    // PDA Offer state account
    #[account(
        init,
        payer = maker,
        space = ANCHOR_DISCRIMINATOR + Offer::INIT_SPACE,
        seeds = [b"offer", maker.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub offer: Account<'info, Offer>,

    // Vault to hold token A
    #[account(
        init,
        payer = maker,
        associated_token::mint = token_mint_a,
        associated_token::authority = offer,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    // Programs
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn send_offered_tokens_to_vault<'info>(
    context: &Context<MakeOffer>,
    token_a_offered_amount: u64,
) -> Result<()> {
    let accounts = &context.accounts;

    transfer_tokens(
        &accounts.maker_token_account_a,
        &accounts.vault,
        &accounts.maker,
        &accounts.token_mint_a,
        &accounts.token_program,
        token_a_offered_amount,
        accounts.token_mint_a.decimals, // ⚠️ might need to fetch via CPI, decimals not always exposed directly
    )?;

    Ok(())
}

pub fn save_offer(
    context: Context<MakeOffer>,
    id: u64,
    token_a_offered_amount: u64,
    token_b_wanted_amount: u64,
    expires_at: i64,
) -> Result<()> {
    // Validate that amounts are greater than 0
    require!(token_a_offered_amount > 0 && token_b_wanted_amount > 0, SwapError::InvalidAmounts);

    // Validate expiry time (minimum 1 hour from now)
    let clock = Clock::get()?;
    let minimum_expiry = clock.unix_timestamp + 3600; // 1 hour = 3600 seconds
    require!(expires_at >= minimum_expiry, SwapError::ExpiryTooSoon);

    let offer = &mut context.accounts.offer;

    offer.set_inner(Offer {
        id,
        maker: context.accounts.maker.key(),
        token_mint_a: context.accounts.token_mint_a.key(),
        token_mint_b: context.accounts.token_mint_b.key(),
        token_a_offered_amount,
        token_b_wanted_amount,
        expires_at,
        bump: context.bumps.offer,
    });

    Ok(())
}
