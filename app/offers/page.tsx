"use client";
import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/hooks/use-program";
import { PublicKey } from "@solana/web3.js";

interface Offer {
  publicKey: string;
  maker: string;
  tokenMintA: string;
  tokenMintB: string;
  offeredAmount: number;
  wantedAmount: number;
  expiresAt: number;
  id: number;
  tokenADecimals: number;
  tokenBDecimals: number;
  rawOfferedAmount: number;
  rawWantedAmount: number;
}

const OffersPage = () => {
  const { connected, publicKey } = useWallet();
  const { connection } = useConnection();
  const { program, fetchOffers, takeOffer } = useProgram();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");
  const [takingOffer, setTakingOffer] = useState<number | null>(null);

  useEffect(() => {
    if (program && connected) {
      loadOffers();
    }
  }, [program, connected]);

  const loadOffers = async () => {
    if (!program || !connected) return;

    setLoading(true);
    try {
      const fetchedOffers = await fetchOffers();
      setOffers(fetchedOffers);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const getTokenName = (mint: string) => {
    // Common Solana token names - in production, fetch from metadata
    const tokenNames: { [key: string]: string } = {
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
      "So11111111111111111111111111111111111111112": "SOL",
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL",
      "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263": "BONK",
      "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "WIF",
    };
    return tokenNames[mint] || `TOKEN_${truncateAddress(mint)}`;
  };

  const isOfferExpired = (expiresAt: number) => {
    return Date.now() / 1000 > expiresAt;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOffers = offers.filter(offer => {
    const isExpired = isOfferExpired(offer.expiresAt);
    const matchesFilter = 
      getTokenName(offer.tokenMintA).toLowerCase().includes(filter.toLowerCase()) ||
      getTokenName(offer.tokenMintB).toLowerCase().includes(filter.toLowerCase()) ||
      offer.maker.toLowerCase().includes(filter.toLowerCase());
    
    // Show only non-expired offers that match filter
    return !isExpired && matchesFilter;
  });

  const handleTakeOffer = async (offerId: number, makerAddress: string) => {
    if (!publicKey || !takeOffer) return;
    
    setTakingOffer(offerId);
    try {
      const maker = new PublicKey(makerAddress);
      const tx = await takeOffer(offerId, maker);
      console.log("✅ Offer taken successfully:", tx);
      
      // Refresh offers after successful transaction
      await loadOffers();
    } catch (error) {
      console.error("❌ Error taking offer:", error);
      // You might want to show a toast notification here
    } finally {
      setTakingOffer(null);
    }
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
            onClick={loadOffers}
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
          {loading ? (
            <div className="pixel-card bg-blue-900 border-blue-400 text-center">
              <h2 className="pixel-subtitle text-blue-400 mb-4">LOADING OFFERS...</h2>
              <p className="pixel-text text-blue-200">
                FETCHING DATA FROM BLOCKCHAIN...
              </p>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="pixel-card bg-yellow-900 border-yellow-400 text-center">
              <h2 className="pixel-subtitle text-yellow-400 mb-4">NO OFFERS FOUND</h2>
              <p className="pixel-text text-yellow-200">
                {filter ? "TRY ADJUSTING YOUR SEARCH" : "BE THE FIRST TO MAKE AN OFFER!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOffers.map((offer) => {
                const isMyOffer = publicKey && offer.maker === publicKey.toBase58();
                const rate = offer.wantedAmount / offer.offeredAmount;
                
                return (
                  <div key={offer.publicKey} className="pixel-card bg-blue-900 border-blue-400">
                    <div className="text-center mb-4">
                      <div className="pixel-card bg-yellow-600 border-yellow-400 inline-block px-3 py-1 mb-3">
                        <span className="text-black font-bold">OFFER #{offer.id}</span>
                      </div>
                      {isMyOffer && (
                        <div className="pixel-card bg-green-600 border-green-400 inline-block px-2 py-1 ml-2">
                          <span className="text-black text-xs font-bold">MY OFFER</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="pixel-text text-blue-200">OFFERING:</span>
                        <span className="pixel-text text-green-400">
                          {offer.offeredAmount.toFixed(offer.tokenADecimals > 0 ? Math.min(4, offer.tokenADecimals) : 2)} {getTokenName(offer.tokenMintA)}
                        </span>
                      </div>

                      <div className="text-center">
                        <div className="pixel-text text-cyan-400">↓ FOR ↓</div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="pixel-text text-blue-200">WANTING:</span>
                        <span className="pixel-text text-red-400">
                          {offer.wantedAmount.toFixed(offer.tokenBDecimals > 0 ? Math.min(4, offer.tokenBDecimals) : 2)} {getTokenName(offer.tokenMintB)}
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
                          {rate.toFixed(6)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="pixel-text text-blue-200">EXPIRES:</span>
                        <span className="pixel-text text-xs text-purple-400">
                          {formatDate(offer.expiresAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleTakeOffer(offer.id, offer.maker)}
                      className="pixel-btn-success w-full"
                      disabled={!connected || isMyOffer || takingOffer === offer.id}
                    >
                      {takingOffer === offer.id ? (
                        "PROCESSING..."
                      ) : isMyOffer ? (
                        "YOUR OFFER"
                      ) : (
                        "ACCEPT TRADE"
                      )}
                    </button>
                  </div>
                );
              })}
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
            <div className="pixel-text text-gray-300">ACTIVE OFFERS</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {offers.filter(offer => isOfferExpired(offer.expiresAt)).length}
            </div>
            <div className="pixel-text text-gray-300">EXPIRED</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-400">
              {new Set(offers.map(offer => offer.maker)).size}
            </div>
            <div className="pixel-text text-gray-300">UNIQUE TRADERS</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;