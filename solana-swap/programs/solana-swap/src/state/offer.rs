use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,                      // 8 bytes
    pub maker: Pubkey,                // 32 bytes
    pub token_mint_a: Pubkey,         // 32 bytes
    pub token_mint_b: Pubkey,         // 32 bytes
    pub token_a_offered_amount: u64,  // 8 bytes
    pub token_b_wanted_amount: u64,   // 8 bytes
    pub expires_at: i64,              // 8 bytes
    pub bump: u8,                     // 1 byte
}