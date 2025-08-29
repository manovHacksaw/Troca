use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    close_account, transfer_checked, CloseAccount, TransferChecked,
};

pub mod instructions;
pub mod state;
pub mod constants;
pub mod errors;

pub use instructions::*;
pub use state::*;
pub use errors::*;
declare_id!("CDnPGAFt6zbNXrYqkJW34BjAvqV2JJBY3UjiLWmQyd1R");

 #[program]
pub mod solana_swap {
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

        // Only maker can cancel before expiry
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


}
