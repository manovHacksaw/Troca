use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,                  // Unique offer ID
    pub maker: Pubkey,            // Offer creator
    pub token_mint_a: Pubkey,     // Offered token mint
    pub token_mint_b: Pubkey,     // Wanted token mint
    pub token_a_offered_amount: u64,  // Amount of token A being offered
    pub token_b_wanted_amount: u64,   // Amount of token B wanted
    pub expires_at: i64,          // Unix timestamp when offer expires
    pub bump: u8,                 // PDA bump
}
