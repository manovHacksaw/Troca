"use client";

import React, { useState, useEffect } from "react";
import { useProgram } from "@/hooks/use-program";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useSearchParams } from "next/navigation";

interface TokenBalance {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  name?: string;
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
  });
  
  const [userTokens, setUserTokens] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "warning" | "info">("info");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchUserTokens();
    }
  }, [connected, publicKey, connection]);

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
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
      "So11111111111111111111111111111111111111112": "SOL",
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "mSOL"
    };
    return knownTokens[mint] || `TKN_${mint.slice(0, 4)}`;
  };

  const getTokenName = (mint: string): string => {
    const knownTokens: { [key: string]: string } = {
      "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USD Coin",
      "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "Tether USD",
      "So11111111111111111111111111111111111111112": "Wrapped SOL",
      "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So": "Marinade SOL"
    };
    return knownTokens[mint] || `Custom Token`;
  };

  const validateForm = (): boolean => {
    const errors: string[] = [];

    // Check if wallet is connected
    if (!connected) {
      errors.push("WALLET NOT CONNECTED");
    }

    // Check required fields
    if (!form.id.trim()) errors.push("OFFER ID REQUIRED");
    if (!form.tokenMintA.trim()) errors.push("TOKEN A REQUIRED");
    if (!form.tokenMintB.trim()) errors.push("TOKEN B REQUIRED");
    if (!form.tokenAOfferedAmount.trim()) errors.push("OFFER AMOUNT REQUIRED");
    if (!form.tokenBWantedAmount.trim()) errors.push("WANTED AMOUNT REQUIRED");

    // Validate numeric fields
    const offerId = Number(form.id);
    const offeredAmount = Number(form.tokenAOfferedAmount);
    const wantedAmount = Number(form.tokenBWantedAmount);

    if (isNaN(offerId) || offerId <= 0) {
      errors.push("INVALID OFFER ID");
    }
    if (isNaN(offeredAmount) || offeredAmount <= 0) {
      errors.push("INVALID OFFER AMOUNT");
    }
    if (isNaN(wantedAmount) || wantedAmount <= 0) {
      errors.push("INVALID WANTED AMOUNT");
    }

    // Check if user owns token A
    const tokenA = userTokens.find(t => t.mint === form.tokenMintA);
    if (form.tokenMintA && !tokenA) {
      errors.push("YOU DON'T OWN TOKEN A");
    }

    // Check if user has enough balance
    if (tokenA && offeredAmount > tokenA.amount) {
      errors.push(`INSUFFICIENT BALANCE: ${tokenA.amount} AVAILABLE`);
    }

    // Check if tokens are different
    if (form.tokenMintA === form.tokenMintB) {
      errors.push("TOKENS MUST BE DIFFERENT");
    }

    // Validate public keys
    try {
      if (form.tokenMintA) new PublicKey(form.tokenMintA);
      if (form.tokenMintB) new PublicKey(form.tokenMintB);
    } catch {
      errors.push("INVALID TOKEN ADDRESS");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setValidationErrors([]); // Clear errors on change
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      setStatus("❌ VALIDATION FAILED");
      setStatusType("error");
      return;
    }

    setLoading(true);
    try {
      setStatus("🔄 CREATING OFFER...");
      setStatusType("info");

      const signature = await makeOffer(
        Number(form.id),
        new PublicKey(form.tokenMintA),
        new PublicKey(form.tokenMintB),
        Number(form.tokenAOfferedAmount),
        Number(form.tokenBWantedAmount)
      );

      setStatus(`✅ OFFER CREATED SUCCESSFULLY!
TX: ${signature}
OFFER ID: ${form.id}`);
      setStatusType("success");

      // Reset form
      setForm({
        id: "",
        tokenMintA: "",
        tokenMintB: "",
        tokenAOfferedAmount: "",
        tokenBWantedAmount: "",
      });

      // Refresh user tokens
      fetchUserTokens();

    } catch (err: any) {
      console.error("Error creating offer:", err);
      setStatus(`❌ ERROR: ${err.message || "UNKNOWN ERROR"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const selectedTokenA = userTokens.find(t => t.mint === form.tokenMintA);

  return (
    <div className="pixel-container py-8">
      <div className="text-center mb-8">
        <h1 className="pixel-title text-cyan-400 mb-4">MAKE OFFER</h1>
        <p className="pixel-text text-gray-300 mb-6">
          CREATE A TOKEN SWAP OFFER
        </p>
      </div>

      {!connected ? (
        <div className="pixel-card bg-red-900 border-red-400 text-center max-w-md mx-auto">
          <h2 className="pixel-subtitle text-red-400 mb-4">WALLET NOT CONNECTED</h2>
          <p className="pixel-text text-red-200">
            CONNECT YOUR WALLET TO CREATE OFFERS
          </p>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="pixel-card bg-purple-900 border-purple-400 mb-6">
              <h2 className="pixel-subtitle text-purple-400 mb-6 text-center">
                OFFER DETAILS
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Offer ID */}
                <div>
                  <label className="block pixel-text text-purple-200 mb-2">
                    OFFER ID:
                  </label>
                  <input
                    type="number"
                    name="id"
                    value={form.id}
                    onChange={handleChange}
                    placeholder="1"
                    required
                    className="pixel-input w-full"
                    min="1"
                  />
                  <p className="pixel-text text-xs text-purple-300 mt-1">
                    UNIQUE IDENTIFIER FOR YOUR OFFER
                  </p>
                </div>

                {/* Token A (Offering) */}
                <div>
                  <label className="block pixel-text text-purple-200 mb-2">
                    TOKEN OFFERING (YOU GIVE):
                  </label>
                  <select
                    name="tokenMintA"
                    value={form.tokenMintA}
                    onChange={handleChange}
                    required
                    className="pixel-input w-full"
                  >
                    <option value="">SELECT TOKEN TO OFFER</option>
                    {userTokens.map((token) => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol} - {token.amount} AVAILABLE
                      </option>
                    ))}
                  </select>
                  {selectedTokenA && (
                    <p className="pixel-text text-xs text-green-400 mt-1">
                      BALANCE: {selectedTokenA.amount} {selectedTokenA.symbol}
                    </p>
                  )}
                </div>

                {/* Amount Offering */}
                <div>
                  <label className="block pixel-text text-purple-200 mb-2">
                    AMOUNT OFFERING:
                  </label>
                  <input
                    type="number"
                    name="tokenAOfferedAmount"
                    value={form.tokenAOfferedAmount}
                    onChange={handleChange}
                    placeholder="100"
                    required
                    className="pixel-input w-full"
                    min="0.000001"
                    step="0.000001"
                    max={selectedTokenA?.amount || undefined}
                  />
                  {selectedTokenA && (
                    <p className="pixel-text text-xs text-purple-300 mt-1">
                      MAX: {selectedTokenA.amount} {selectedTokenA.symbol}
                    </p>
                  )}
                </div>

                {/* Token B (Wanted) */}
                <div>
                  <label className="block pixel-text text-purple-200 mb-2">
                    TOKEN WANTED (YOU GET):
                  </label>
                  <input
                    type="text"
                    name="tokenMintB"
                    value={form.tokenMintB}
                    onChange={handleChange}
                    placeholder="Token mint address..."
                    required
                    className="pixel-input w-full"
                  />
                  <p className="pixel-text text-xs text-purple-300 mt-1">
                    ENTER THE MINT ADDRESS OF DESIRED TOKEN
                  </p>
                </div>

                {/* Amount Wanted */}
                <div>
                  <label className="block pixel-text text-purple-200 mb-2">
                    AMOUNT WANTED:
                  </label>
                  <input
                    type="number"
                    name="tokenBWantedAmount"
                    value={form.tokenBWantedAmount}
                    onChange={handleChange}
                    placeholder="50"
                    required
                    className="pixel-input w-full"
                    min="0.000001"
                    step="0.000001"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || validationErrors.length > 0}
                  className="pixel-btn-primary w-full py-4"
                >
                  {loading ? "CREATING OFFER..." : "CREATE OFFER"}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div className="pixel-card bg-red-900 border-red-400">
                <h3 className="pixel-subtitle text-red-400 mb-4">
                  VALIDATION ERRORS
                </h3>
                <ul className="space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="pixel-text text-red-200 text-xs">
                      • {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Status */}
            {status && (
              <div className={`pixel-status-${statusType}`}>
                <p className="pixel-text whitespace-pre-line break-words text-center">
                  {status}
                </p>
              </div>
            )}

            {/* Your Tokens */}
            <div className="pixel-card bg-blue-900 border-blue-400">
              <h3 className="pixel-subtitle text-blue-400 mb-4">
                YOUR TOKENS
              </h3>
              {userTokens.length === 0 ? (
                <p className="pixel-text text-blue-200">
                  NO TOKENS FOUND
                </p>
              ) : (
                <div className="space-y-2">
                  {userTokens.slice(0, 5).map((token) => (
                    <div key={token.mint} className="flex justify-between items-center">
                      <span className="pixel-text text-blue-200 text-xs">
                        {token.symbol}
                      </span>
                      <span className="pixel-text text-yellow-400 text-xs">
                        {token.amount}
                      </span>
                    </div>
                  ))}
                  {userTokens.length > 5 && (
                    <p className="pixel-text text-blue-300 text-xs">
                      +{userTokens.length - 5} MORE...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Trade Info */}
            <div className="pixel-card bg-yellow-900 border-yellow-400">
              <h3 className="pixel-subtitle text-yellow-400 mb-4">
                TRADE INFO
              </h3>
              {form.tokenAOfferedAmount && form.tokenBWantedAmount && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="pixel-text text-yellow-200">RATE:</span>
                    <span className="pixel-text text-white">
                      {(Number(form.tokenBWantedAmount) / Number(form.tokenAOfferedAmount)).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="pixel-text text-yellow-200">GIVING:</span>
                    <span className="pixel-text text-red-400">
                      {form.tokenAOfferedAmount} {selectedTokenA?.symbol || "TKN"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="pixel-text text-yellow-200">GETTING:</span>
                    <span className="pixel-text text-green-400">
                      {form.tokenBWantedAmount} TKN
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
