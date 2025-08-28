use anchor_lang::prelude::*;
pub mod instructions;
pub mod state;
pub mod constants;
pub use instructions::*;
declare_id!("A4xcEpdNUkcycpmMekrGE3jWKQket1fnsWhNVh5G5LG8");

 #[program] // FIX: Add the #[program] attribute to the mod
pub mod solana_swap { // FIX: Wrap your instructions in a mod and `use super::*;`
    use super::*;

    pub fn make_offer(
        context: Context<MakeOffer>,
        id: u64,
        token_a_offered_amount: u64,
        token_b_wanted_amount: u64,
         expires_at: i64,  
    ) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault(&context, token_a_offered_amount)?;
        instructions::make_offer::save_offer(context,
        id,
        token_a_offered_amount,
        token_b_wanted_amount,
        expires_at)
    }

    pub fn take_offer(ctx: Context<TakeOffer>) -> Result<()> {
    let offer = &ctx.accounts.offer;
    let clock = Clock::get()?;

    // ✅ Check expiry
    if clock.unix_timestamp > offer.expires_at {
        return err!(SwapError::OfferExpired); // custom error
    }

    // Otherwise, proceed with swap
    instructions::take_offer::send_wanted_tokens_to_maker(&ctx)?;
    instructions::take_offer::withdraw_and_close_vault(ctx)
}

    pub fn cancel_offer(ctx: Context<CancelOffer>) -> Result<()> {
    let offer = &ctx.accounts.offer;
    let clock = Clock::get()?;

    // ✅ Only maker OR anyone after expiry can cancel
    if ctx.accounts.maker.key() != offer.maker && clock.unix_timestamp <= offer.expires_at {
        return err!(SwapError::UnauthorizedCancel);
    }

    // Return funds to maker
    let seeds = &[b"vault".as_ref(), &[ctx.bumps.vault]];
    let signer = &[&seeds[..]];
    let cpi_accounts = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.maker_token_account.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer);
    token::transfer(cpi_ctx, offer.token_a_offered_amount)?;

    // Close vault
    let cpi_close = CloseAccount {
        account: ctx.accounts.vault_token_account.to_account_info(),
        destination: ctx.accounts.maker.to_account_info(),
        authority: ctx.accounts.vault_authority.to_account_info(),
    };
    let cpi_ctx_close = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_close, signer);
    token::close_account(cpi_ctx_close)?;

    Ok(())
}


}