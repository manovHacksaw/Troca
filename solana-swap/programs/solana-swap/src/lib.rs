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
    ) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault(&context, token_a_offered_amount)?;
        instructions::make_offer::save_offer(context, id, token_b_wanted_amount)
    }

    pub fn take_offer(context: Context<TakeOffer>) -> Result<()> {
        // You need to pass the amount of token B from the client
         instructions::take_offer::send_wanted_tokens_to_maker(&context)?;
        instructions::take_offer::withdraw_and_close_vault(context)
    }
}