"use client";

import React, {useState, useEffect } from "react";
import { useProgram } from "@/hooks/use-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Metaplex } from "@metaplex-foundation/js";

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  name?: string;
}

// Interface for the fetched metadata of the token the user wants
interface TokenBInfo {
  symbol: string;
  name: string;
}

export default function MakeOfferPage() {
  const { makeOffer } = useProgram();
  const { connection } = useConnection();
  const { connected, publicKey } = useWallet();
  const searchParams = useSearchParams();
  
  const [form, setForm] = useState({
    id: "",
    tokenMintA: searchParams?.get("tokenA") || "",
    tokenMintB: "",
    tokenAOfferedAmount: "",
    tokenBWantedAmount: "",
    expiryDate: "",
  });
  
  const [userTokens, setUserTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "warning" | "info">("info");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  // New state for fetching metadata for the "wanted" token (Token B)
  const [tokenBInfo, setTokenBInfo] = useState<TokenBInfo | null>(null);
  const [isFetchingTokenB, setIsFetchingTokenB] = useState(false);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserTokens();
    }
  }, [connected, publicKey, connection]);

  // ✨ NEW: useEffect to fetch metadata for token B when its mint address is entered
  useEffect(() => {
    const fetchTokenBMetadata = async (mint: string) => {
      if (!connection) return;
      try {
        new PublicKey(mint); // First, check if the string is a valid public key format
        setIsFetchingTokenB(true);
        setTokenBInfo(null);

        const mx = Metaplex.make(connection);
        const tokenMeta = await mx.nfts().findByMint({ mintAddress: new PublicKey(mint) });

        if (tokenMeta && tokenMeta.symbol) {
          setTokenBInfo({ symbol: tokenMeta.symbol, name: tokenMeta.name });
        } else {
           // Fallback for well-known tokens if Metaplex fails
           const symbol = getTokenSymbol(mint);
           if (!symbol.startsWith("TKN_")) {
                setTokenBInfo({ symbol, name: getTokenName(mint) });
           } else {
                setTokenBInfo(null);
           }
        }
      } catch (error) {
        console.error("Could not fetch token B metadata:", error);
        setTokenBInfo(null);
      } finally {
        setIsFetchingTokenB(false);
      }
    };

    // Basic validation and debouncing to avoid excessive API calls
    if (form.tokenMintB.trim().length >= 32 && form.tokenMintB.trim().length <= 44) {
      const handler = setTimeout(() => {
        fetchTokenBMetadata(form.tokenMintB.trim());
      }, 500); // 500ms debounce

      return () => clearTimeout(handler);
    } else {
      setTokenBInfo(null); // Clear info if input is invalid or empty
    }
  }, [form.tokenMintB, connection]);


  const fetchUserTokens = async () => {
    if (!publicKey) return;

    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });

      const tokenList = accounts.value
        .map(acc => {
          const info = acc.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount || 0,
            decimals: info.tokenAmount.decimals,
            symbol: getTokenSymbol(info.mint),
            name: getTokenName(info.mint)
          };
        })
        .filter(token => token.amount > 0);

      setUserTokens(tokenList);
    } catch (error) {
      console.error("Error fetching user tokens:", error);
    }
  };

  const getTokenSymbol = (mint: string): string => {
    const knownTokens: { [key: string]: string } = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
      So11111111111111111111111111111111111111112: "SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL"
    };
    return knownTokens[mint] || `TKN_${mint.slice(0, 4)}`;
  };

  const getTokenName = (mint: string): string => {
    const knownTokens: { [key: string]: string } = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USD Coin",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "Tether USD",
      So11111111111111111111111111111111111111112: "Wrapped SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "Marinade SOL"
    };
    return knownTokens[mint] || `Custom Token`;
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!connected) errors.push("Wallet not connected");
    if (!form.id.trim()) errors.push("Offer ID required");
    if (!form.tokenMintA.trim()) errors.push("Token A required");
    if (!form.tokenMintB.trim()) errors.push("Token B required");
    if (!form.tokenAOfferedAmount.trim()) errors.push("Offer amount required");
    if (!form.tokenBWantedAmount.trim()) errors.push("Wanted amount required");
    if (!form.expiryDate.trim()) errors.push("Expiry date required");

    const offerId = Number(form.id);
    const offeredAmount = Number(form.tokenAOfferedAmount);
    const wantedAmount = Number(form.tokenBWantedAmount);

    if (isNaN(offerId) || offerId <= 0) errors.push("Invalid Offer ID");
    if (isNaN(offeredAmount) || offeredAmount <= 0) errors.push("Invalid offer amount");
    if (isNaN(wantedAmount) || wantedAmount <= 0) errors.push("Invalid wanted amount");

    const tokenA = userTokens.find((t) => t.mint === form.tokenMintA);
    if (form.tokenMintA && !tokenA) errors.push("You don't own Token A");
    if (tokenA && offeredAmount > tokenA.amount) errors.push(`Insufficient balance: ${tokenA.amount} available`);
    if (form.tokenMintA === form.tokenMintB) errors.push("Tokens must be different");

    if (form.expiryDate) {
      const expiryTime = new Date(form.expiryDate).getTime();
      const oneHourFromNow = Date.now() + 60 * 60 * 1000;
      if (isNaN(expiryTime)) errors.push("Invalid expiry date");
      else if (expiryTime < oneHourFromNow) errors.push("Expiry must be at least 1 hour from now");
    }

    try {
      if (form.tokenMintA) new PublicKey(form.tokenMintA);
      if (form.tokenMintB) new PublicKey(form.tokenMintB);
    } catch {
      errors.push("Invalid token address");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationErrors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus("Validation failed");
      setStatusType("error");
      return;
    }

    setLoading(true);
    try {
      setStatus("Creating offer...");
      setStatusType("info");

      const expiryTimestamp = Math.floor(new Date(form.expiryDate).getTime() / 1000);

      const signature = await makeOffer(
        Number(form.id),
        new PublicKey(form.tokenMintA),
        new PublicKey(form.tokenMintB),
        Number(form.tokenAOfferedAmount),
        Number(form.tokenBWantedAmount),
        expiryTimestamp
      );

      setStatus(`Offer created successfully!\nTX: ${signature}\nOFFER ID: ${form.id}`);
      setStatusType("success");

      setForm({
        id: "",
        tokenMintA: "",
        tokenMintB: "",
        tokenAOfferedAmount: "",
        tokenBWantedAmount: "",
        expiryDate: "",
      });

      fetchUserTokens();
    } catch (err: any) {
      console.error("Error creating offer:", err);
      setStatus(err.message || "Unknown error");
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const selectedTokenA = userTokens.find((t) => t.mint === form.tokenMintA);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Make Offer</h1>
        <p className="text-sm text-zinc-400 mt-2">Create a token swap offer</p>
      </div>

      {!connected ? (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/20 p-6 text-center max-w-md mx-auto">
          <h2 className="text-rose-300 font-medium mb-2">Wallet not connected</h2>
          <p className="text-sm text-rose-200/80">Connect your wallet to create offers</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-6 mb-6">
              <h2 className="text-lg font-medium text-white mb-6 text-center">Offer Details</h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Offer ID</label>
                  <input
                    type="number"
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="1"
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Token Offering (you give)</label>
                  <select
                    name="tokenMintA"
                    value={form.tokenMintA}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="">Select token to offer</option>
                    {userTokens.map((token) => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol} - {token.amount} available
                      </option>
                    ))}
                  </select>
                  {selectedTokenA && (
                    <p className="text-xs text-emerald-300 mt-1">
                      Balance: {selectedTokenA.amount} {selectedTokenA.symbol}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Amount Offering</label>
                  <input
                    type="number"
                    name="tokenAOfferedAmount"
                    value={form.tokenAOfferedAmount}
                    onChange={handleChange}
                    placeholder="100"
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                    min={0.000001}
                    step={0.000001}
                    max={selectedTokenA?.amount || undefined}
                  />
                  {selectedTokenA && (
                    <p className="text-xs text-zinc-400 mt-1">Max: {selectedTokenA.amount} {selectedTokenA.symbol}</p>
                  )}
                </div>

                {/* ✨ UPDATED: Token B input with real-time feedback */}
                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Token Wanted (you get)</label>
                  <input
                    type="text"
                    name="tokenMintB"
                    value={form.tokenMintB}
                    onChange={handleChange}
                    placeholder="Token mint address..."
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                  />
                   {isFetchingTokenB ? (
                    <p className="text-xs text-amber-300 mt-1">Fetching token info...</p>
                  ) : tokenBInfo ? (
                    <p className="text-xs text-emerald-300 mt-1">
                      Token Found: {tokenBInfo.name} ({tokenBInfo.symbol})
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 mt-1">
                      Enter the mint address of desired token.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Amount Wanted</label>
                  <input
                    type="number"
                    name="tokenBWantedAmount"
                    value={form.tokenBWantedAmount}
                    onChange={handleChange}
                    placeholder="50"
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                    min={0.000001}
                    step={0.000001}
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-2">Expiry Date & Time</label>
                  <input
                    type="datetime-local"
                    name="expiryDate"
                    value={form.expiryDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                    min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                  />
                  <p className="text-xs text-zinc-500 mt-1">Offer expires at this date/time (minimum 1 hour from now)</p>
                </div>

                <Button type="submit" className="w-full" disabled={loading || validationErrors.length > 0}>
                  {loading ? "Creating offer..." : "Create offer"}
                </Button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            {validationErrors.length > 0 && (
              <div className="rounded-xl border border-rose-700/40 bg-rose-900/20 p-4">
                <h3 className="text-rose-300 font-medium mb-2">Validation errors</h3>
                <ul className="space-y-1 list-disc list-inside text-sm text-rose-200/90">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {status && (
              <div
                className={
                  statusType === "success"
                    ? "rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-4 text-emerald-200"
                    : statusType === "error"
                    ? "rounded-xl border border-rose-700/40 bg-rose-900/20 p-4 text-rose-200"
                    : statusType === "warning"
                    ? "rounded-xl border border-amber-700/40 bg-amber-900/20 p-4 text-amber-200"
                    : "rounded-xl border border-cyan-700/40 bg-cyan-900/20 p-4 text-cyan-200"
                }
              >
                <pre className="whitespace-pre-wrap break-words text-sm">{status}</pre>
              </div>
            )}

            <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-5">
              <h3 className="text-white font-medium mb-4">Your Tokens</h3>
              {userTokens.length === 0 ? (
                <p className="text-sm text-zinc-400">No tokens found</p>
              ) : (
                <div className="space-y-2">
                  {userTokens.slice(0, 5).map((token) => (
                    <div key={token.mint} className="flex justify-between items-center text-sm">
                      <span className="text-zinc-300">{token.symbol}</span>
                      <span className="text-amber-300">{token.amount}</span>
                    </div>
                  ))}
                  {userTokens.length > 5 && (
                    <p className="text-xs text-zinc-500">+{userTokens.length - 5} more…</p>
                  )}
                </div>
              )}
            </div>
            
            {/* ✨ UPDATED: Trade Info panel now shows the symbol of the wanted token */}
            <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-5">
              <h3 className="text-white font-medium mb-4">Trade Info</h3>
              {form.tokenAOfferedAmount && form.tokenBWantedAmount && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Rate</span>
                    <span className="text-white">
                      {(Number(form.tokenBWantedAmount) / Number(form.tokenAOfferedAmount)).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Giving</span>
                    <span className="text-rose-300">
                      {form.tokenAOfferedAmount} {selectedTokenA?.symbol || "TKN"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Getting</span>
                    <span className="text-emerald-300">{form.tokenBWantedAmount} {tokenBInfo?.symbol || "TKN"}</span>
                  </div>
                  {form.expiryDate && (
                    <div className="border-t border-[var(--border)] pt-2 mt-2 text-xs text-zinc-400">
                      <div className="flex justify-between">
                        <span>Expires</span>
                        <span>
                          {new Date(form.expiryDate).toLocaleDateString()} {new Date(form.expiryDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}