"use client";
import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useProgram } from "@/hooks/use-program";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";

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

  const truncateAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`;

  const getTokenName = (mint: string) => {
    const tokenNames: { [key: string]: string } = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
      So11111111111111111111111111111111111111112: "SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL",
      DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263: "BONK",
      "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs": "WIF",
    };
    return tokenNames[mint] || `TOKEN_${truncateAddress(mint)}`;
  };

  const isOfferExpired = (expiresAt: number) => Date.now() / 1000 > expiresAt;

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const filteredOffers = offers.filter((offer) => {
    const isExpired = isOfferExpired(offer.expiresAt);
    const matchesFilter =
      getTokenName(offer.tokenMintA).toLowerCase().includes(filter.toLowerCase()) ||
      getTokenName(offer.tokenMintB).toLowerCase().includes(filter.toLowerCase()) ||
      offer.maker.toLowerCase().includes(filter.toLowerCase());
    return !isExpired && matchesFilter;
  });

  const handleTakeOffer = async (offerId: number, makerAddress: string) => {
    if (!publicKey || !takeOffer) return;
    setTakingOffer(offerId);
    try {
      const maker = new PublicKey(makerAddress);
      const tx = await takeOffer(offerId, maker);
      console.log("✅ Offer taken successfully:", tx);
      await loadOffers();
    } catch (error) {
      console.error("❌ Error taking offer:", error);
    } finally {
      setTakingOffer(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Open Offers</h1>
        <p className="text-sm text-zinc-400 mt-2">Browse and accept token trading offers</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-5 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-xs text-zinc-400">Search</label>
            <input
              type="text"
              placeholder="Token or maker..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full md:w-64 rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
            />
          </div>
          <Button onClick={loadOffers} disabled={!connected || loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </div>

      {!connected ? (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/20 p-6 text-center">
          <h2 className="text-rose-300 font-medium mb-2">Wallet not connected</h2>
          <p className="text-sm text-rose-200/80">Connect your wallet to view and accept offers</p>
        </div>
      ) : loading ? (
        <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-6 text-center">
          <h2 className="text-blue-300 font-medium mb-2">Loading offers...</h2>
          <p className="text-sm text-blue-200/80">Fetching data from blockchain</p>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-6 text-center">
          <h2 className="text-amber-300 font-medium mb-2">No offers found</h2>
          <p className="text-sm text-amber-200/80">
            {filter ? "Try adjusting your search" : "Be the first to make an offer!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => {
            const isMyOffer = publicKey && offer.maker === publicKey.toBase58();
            const rate = offer.wantedAmount / offer.offeredAmount;

            return (
              <div key={offer.publicKey} className="rounded-xl border border-[var(--border)] bg-[#111213] p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-mono text-zinc-400">Offer #{offer.id}</div>
                  {isMyOffer && (
                    <div className="text-[10px] font-semibold text-black bg-[var(--primary)]/90 px-2 py-1 rounded">
                      My Offer
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Offering</span>
                    <span className="text-sm font-medium text-emerald-300">
                      {offer.offeredAmount.toFixed(
                        offer.tokenADecimals > 0 ? Math.min(4, offer.tokenADecimals) : 2
                      )} {getTokenName(offer.tokenMintA)}
                    </span>
                  </div>

                  <div className="text-center text-[var(--primary)] text-xs">↓ for ↓</div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Wanting</span>
                    <span className="text-sm font-medium text-rose-300">
                      {offer.wantedAmount.toFixed(
                        offer.tokenBDecimals > 0 ? Math.min(4, offer.tokenBDecimals) : 2
                      )} {getTokenName(offer.tokenMintB)}
                    </span>
                  </div>

                  <div className="border-t border-[var(--border)] pt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Maker</span>
                      <span className="text-xs font-mono text-zinc-400">
                        {truncateAddress(offer.maker)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Rate</span>
                      <span className="text-xs text-amber-300">{rate.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-zinc-500">Expires</span>
                      <span className="text-xs text-purple-300">{formatDate(offer.expiresAt)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleTakeOffer(offer.id, offer.maker)}
                  disabled={!connected || isMyOffer || takingOffer === offer.id}
                >
                  {takingOffer === offer.id ? "Processing..." : isMyOffer ? "Your offer" : "Accept trade"}
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-xl border border-[var(--border)] bg-[#0F0F0F] p-5 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-[var(--primary)]">{offers.length}</div>
            <div className="text-xs text-zinc-400">Total offers</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-emerald-300">{filteredOffers.length}</div>
            <div className="text-xs text-zinc-400">Active offers</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-amber-300">
              {offers.filter((offer) => isOfferExpired(offer.expiresAt)).length}
            </div>
            <div className="text-xs text-zinc-400">Expired</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-rose-300">
              {new Set(offers.map((offer) => offer.maker)).size}
            </div>
            <div className="text-xs text-zinc-400">Unique traders</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffersPage;
