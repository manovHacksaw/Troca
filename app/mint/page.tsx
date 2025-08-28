"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity, token } from "@metaplex-foundation/js";

export default function MintPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    decimals: 6,
    supply: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<"success" | "error" | "warning" | "info">("info");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.connected || !wallet.publicKey) {
      setStatus("❌ CONNECT WALLET FIRST!");
      setStatusType("error");
      return;
    }

    // Validate form inputs
    if (!form.name.trim() || !form.symbol.trim() || !form.supply.trim()) {
      setStatus("❌ FILL ALL FIELDS!");
      setStatusType("error");
      return;
    }

    const supplyAmount = Number(form.supply);
    if (isNaN(supplyAmount) || supplyAmount <= 0) {
      setStatus("❌ INVALID SUPPLY AMOUNT!");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("⛏️ CREATING TOKEN...");
      setStatusType("info");

      // Setup Metaplex
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // Create the token mint
      const { mint } = await metaplex.tokens().createMint({
        decimals: Number(form.decimals),
      });

      setStatus("💎 MINTING TO WALLET...");
      setStatusType("info");

      // Mint tokens to the connected wallet
      await metaplex.tokens().mint({
        mintAddress: mint.address,
        amount: token(supplyAmount, Number(form.decimals)),
        toOwner: wallet.publicKey,
      });

      setStatus(`✅ TOKEN CREATED SUCCESSFULLY!
MINT: ${mint.address.toBase58()}
MINTED: ${supplyAmount} ${form.symbol}
TO: YOUR WALLET`);
      setStatusType("success");
      
      // Reset form
      setForm({
        name: "",
        symbol: "",
        decimals: 6,
        supply: "",
      });

    } catch (err: any) {
      console.error("Token creation error:", err);
      let errorMessage = "UNKNOWN ERROR";
      
      if (err.message) {
        errorMessage = err.message.toUpperCase();
      } else if (err.toString) {
        errorMessage = err.toString().toUpperCase();
      }
      
      setStatus(`❌ ERROR: ${errorMessage}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pixel-container py-8">
      <div className="text-center mb-8">
        <h1 className="pixel-title text-cyan-400 mb-4">MINT TOKENS</h1>
        <p className="pixel-text text-gray-300 mb-6">
          CREATE YOUR OWN SPL TOKENS ON SOLANA
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Main Form */}
        <div className="pixel-card bg-purple-900 border-purple-400 mb-6">
          <h2 className="pixel-subtitle text-purple-400 mb-6 text-center">
            TOKEN FACTORY
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Token Name */}
            <div>
              <label className="block pixel-text text-purple-200 mb-2">
                TOKEN NAME:
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="MY AWESOME TOKEN"
                required
                className="pixel-input w-full"
                maxLength={32}
              />
              <p className="pixel-text text-xs text-purple-300 mt-1">
                MAX 32 CHARACTERS
              </p>
            </div>

            {/* Symbol */}
            <div>
              <label className="block pixel-text text-purple-200 mb-2">
                SYMBOL:
              </label>
              <input
                type="text"
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
                placeholder="MAT"
                required
                maxLength={10}
                style={{ textTransform: 'uppercase' }}
                className="pixel-input w-full"
              />
              <p className="pixel-text text-xs text-purple-300 mt-1">
                MAX 10 CHARACTERS, UPPERCASE
              </p>
            </div>

            {/* Decimals */}
            <div>
              <label className="block pixel-text text-purple-200 mb-2">
                DECIMALS:
              </label>
              <input
                type="number"
                name="decimals"
                value={form.decimals}
                onChange={handleChange}
                min={0}
                max={9}
                required
                className="pixel-input w-full"
              />
              <p className="pixel-text text-xs text-purple-300 mt-1">
                0-9 (6 IS STANDARD)
              </p>
            </div>

            {/* Supply */}
            <div>
              <label className="block pixel-text text-purple-200 mb-2">
                INITIAL SUPPLY:
              </label>
              <input
                type="number"
                name="supply"
                value={form.supply}
                onChange={handleChange}
                placeholder="1000000"
                required
                min="1"
                className="pixel-input w-full"
              />
              <p className="pixel-text text-xs text-purple-300 mt-1">
                TOKENS TO MINT TO YOUR WALLET
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !wallet.connected}
              className="pixel-btn-primary w-full py-4"
            >
              {loading ? "CREATING..." : wallet.connected ? "MINT TOKEN" : "CONNECT WALLET FIRST"}
            </button>
          </form>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`pixel-status-${statusType} mb-6`}>
            <p className="pixel-text whitespace-pre-line break-words text-center">
              {status}
            </p>
          </div>
        )}

        {/* Info Panel */}
        <div className="pixel-card bg-blue-900 border-blue-400">
          <h3 className="pixel-subtitle text-blue-400 mb-4">
            MINTING INFO
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="pixel-text text-blue-200">NETWORK:</span>
              <span className="pixel-text text-yellow-400">SOLANA DEVNET</span>
            </div>
            <div className="flex justify-between">
              <span className="pixel-text text-blue-200">STANDARD:</span>
              <span className="pixel-text text-yellow-400">SPL TOKEN</span>
            </div>
            <div className="flex justify-between">
              <span className="pixel-text text-blue-200">COST:</span>
              <span className="pixel-text text-green-400">~0.002 SOL</span>
            </div>
            <div className="flex justify-between">
              <span className="pixel-text text-blue-200">TIME:</span>
              <span className="pixel-text text-green-400">~5 SECONDS</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="pixel-card bg-yellow-900 border-yellow-400 mt-6">
          <h3 className="pixel-subtitle text-yellow-400 mb-4">
            PRO TIPS
          </h3>
          <ul className="space-y-2">
            <li className="pixel-text text-yellow-200">
              • CHOOSE A MEMORABLE SYMBOL
            </li>
            <li className="pixel-text text-yellow-200">
              • 6 DECIMALS IS STANDARD FOR MOST TOKENS
            </li>
            <li className="pixel-text text-yellow-200">
              • YOU CAN MINT MORE TOKENS LATER
            </li>
            <li className="pixel-text text-yellow-200">
              • SAVE YOUR MINT ADDRESS FOR TRADING
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
