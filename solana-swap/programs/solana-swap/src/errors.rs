use anchor_lang::prelude::*;

#[error_code]
pub enum SwapError {
    #[msg("This offer has expired and can no longer be accepted.")]
    OfferExpired,
    
    #[msg("Only the maker of the offer can cancel it before expiry.")]
    UnauthorizedCancel,
    
    #[msg("Expiry time must be at least 1 hour from now.")]
    ExpiryTooSoon,
    
    #[msg("Invalid token amounts. Both offered and wanted amounts must be greater than 0.")]
    InvalidAmounts,
    
    #[msg("Insufficient balance to complete the offer.")]
    InsufficientBalance,
}
