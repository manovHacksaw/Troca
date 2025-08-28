"use client";
import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/hooks/use-program";
import { PublicKey } from "@solana/web3.js";

interface Offer {
  id: number;
  maker: string;
  tokenMintA: string;
  tokenMintB: string;
  tokenBWantedAmount: number;
  tokenAOfferedAmount?: number;
}

const OffersPage = () => {
  const { connected } = useWallet();
  const { connection } = useConnection();
  const { program, fetchOffers: getOffers } = useProgram();


  
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  

  // Mock data for now since we need to implement proper offer fetching
  useEffect(() => {

    

    getOffers();
    const mockOffers: Offer[] = [
      {
        id: 1,
        maker: "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM",
        tokenMintA: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        tokenMintB: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        tokenBWantedAmount: 1000,
        tokenAOfferedAmount: 500
      },
      {
        id: 2,
        maker: "3pMvTLUA9NzRQd7gwoQnTgU5Zg7F6E5xF1qH7uBnwAWA",
        tokenMintA: "So11111111111111111111111111111111111111112",
        tokenMintB: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        tokenBWantedAmount: 2000,
        tokenAOfferedAmount: 1500
      },
      {
        id: 3,
        maker: "H6ARHf6YXhGYeQfUzQNGk6rDNnLBQKrenN712K4AQJEG",
        tokenMintA: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
        tokenMintB: "So11111111111111111111111111111111111111112",
        tokenBWantedAmount: 750,
        tokenAOfferedAmount: 800
      }
    ];
 
    setOffers(mockOffers);
  }, []);

  useEffect(() => {
  if (!program) return; // wait until program is initialized

  const loadOffers = async () => {
    const offers = await getOffers();
    // setOffers(offers);
  };

  loadOffers();
}, [program]);

  const fetchOffers = async () => {
    if (!program || !connected) return;

    setLoading(true);
    try {
      const programOffers = await program.account.offer.all();
      const formattedOffers = programOffers.map((offer: any) => ({
        id: offer.account.id.toNumber(),
        maker: offer.account.maker.toBase58(),
        tokenMintA: offer.account.tokenMintA.toBase58(),
        tokenMintB: offer.account.tokenMintB.toBase58(),
        tokenBWantedAmount: offer.account.tokenBWantedAmount.toNumber(),
        // Note: tokenAOfferedAmount is stored in the vault, would need to fetch separately
        tokenAOfferedAmount: 0 // Placeholder
      }));
      setOffers(formattedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      // Keep mock data on error for demo purposes
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getTokenName = (mint: string) => {
    // Mock token names - in real app, fetch from metadata
    const tokenNames: { [key: string]: string } = {
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
      "So11111111111111111111111111111111111111112": "SOL",
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL"
    };
    return tokenNames[mint] || `TOKEN_${truncateAddress(mint)}`;
  };

  const filteredOffers = offers.filter(offer => 
    getTokenName(offer.tokenMintA).toLowerCase().includes(filter.toLowerCase()) ||
    getTokenName(offer.tokenMintB).toLowerCase().includes(filter.toLowerCase()) ||
    offer.maker.toLowerCase().includes(filter.toLowerCase())
  );

  const takeOffer = async (offerId: number) => {
    // TODO: Implement take offer functionality
    console.log("Taking offer:", offerId);
  };

  return (
    <div className="pixel-container py-8">
      <div className="text-center mb-8">
        <h1 className="pixel-title text-cyan-400 mb-4">OPEN OFFERS</h1>
        <p className="pixel-text text-gray-300 mb-6">
          BROWSE AND ACCEPT TOKEN TRADING OFFERS
        </p>
      </div>

      {/* Filters */}
      <div className="pixel-card bg-purple-900 border-purple-400 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="pixel-text text-purple-200">SEARCH:</label>
            <input
              type="text"
              placeholder="Token or maker..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pixel-input"
            />
          </div>
          <button
            onClick={fetchOffers}
            disabled={!connected || loading}
            className="pixel-btn-primary"
          >
            {loading ? "LOADING..." : "REFRESH"}
          </button>
        </div>
      </div>

      {!connected ? (
        <div className="pixel-card bg-red-900 border-red-400 text-center">
          <h2 className="pixel-subtitle text-red-400 mb-4">WALLET NOT CONNECTED</h2>
          <p className="pixel-text text-red-200">
            CONNECT YOUR WALLET TO VIEW AND ACCEPT OFFERS
          </p>
        </div>
      ) : (
        <>
          {filteredOffers.length === 0 ? (
            <div className="pixel-card bg-yellow-900 border-yellow-400 text-center">
              <h2 className="pixel-subtitle text-yellow-400 mb-4">NO OFFERS FOUND</h2>
              <p className="pixel-text text-yellow-200">
                {filter ? "TRY ADJUSTING YOUR SEARCH" : "BE THE FIRST TO MAKE AN OFFER!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="pixel-card bg-blue-900 border-blue-400">
                  <div className="text-center mb-4">
                    <div className="pixel-card bg-yellow-600 border-yellow-400 inline-block px-3 py-1 mb-3">
                      <span className="text-black font-bold">OFFER #{offer.id}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="pixel-text text-blue-200">OFFERING:</span>
                      <span className="pixel-text text-green-400">
                        {offer.tokenAOfferedAmount} {getTokenName(offer.tokenMintA)}
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="pixel-text text-cyan-400">↓ FOR ↓</div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="pixel-text text-blue-200">WANTING:</span>
                      <span className="pixel-text text-red-400">
                        {offer.tokenBWantedAmount} {getTokenName(offer.tokenMintB)}
                      </span>
                    </div>

                    <div className="border-t border-blue-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="pixel-text text-blue-200">MAKER:</span>
                        <span className="pixel-text text-xs text-gray-400">
                          {truncateAddress(offer.maker)}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="pixel-text text-blue-200">RATE:</span>
                      <span className="pixel-text text-xs text-yellow-400">
                        {((offer.tokenBWantedAmount || 0) / (offer.tokenAOfferedAmount || 1)).toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => takeOffer(offer.id)}
                    className="pixel-btn-success w-full"
                    disabled={!connected}
                  >
                    ACCEPT TRADE
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Stats */}
      <div className="pixel-card bg-gray-800 border-gray-400 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">{offers.length}</div>
            <div className="pixel-text text-gray-300">TOTAL OFFERS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{filteredOffers.length}</div>
            <div className="pixel-text text-gray-300">FILTERED</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">24</div>
            <div className="pixel-text text-gray-300">ACTIVE TRADERS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">7</div>
            <div className="pixel-text text-gray-300">RECENT TRADES</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
