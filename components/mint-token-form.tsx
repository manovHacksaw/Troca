"use client";

import { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Metaplex, walletAdapterIdentity, token } from "@metaplex-foundation/js";
import { PublicKey } from "@solana/web3.js";

export default function MintTokenForm() {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.connected || !wallet.publicKey) {
      setStatus("❌ Please connect your wallet first!");
      return;
    }

    // Validate form inputs
    if (!form.name.trim() || !form.symbol.trim() || !form.supply.trim()) {
      setStatus("❌ Please fill in all fields");
      return;
    }

    const supplyAmount = Number(form.supply);
    if (isNaN(supplyAmount) || supplyAmount <= 0) {
      setStatus("❌ Supply must be a positive number");
      return;
    }

    try {
      setLoading(true);
      setStatus("Creating token...");

      // Setup Metaplex
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));

      // Create the token mint
      const { mint } = await metaplex.tokens().createMint({
        decimals: Number(form.decimals),
      });

      setStatus("Minting tokens to your wallet...");

      // Mint tokens to the connected wallet
      await metaplex.tokens().mint({
        mintAddress: mint.address,
        amount: token(supplyAmount, Number(form.decimals)),
        toOwner: wallet.publicKey,
      });

      setStatus(`✅ Token created successfully!
Mint Address: ${mint.address.toBase58()}
${supplyAmount} ${form.symbol} tokens minted to your wallet`);
      
      // Reset form
      setForm({
        name: "",
        symbol: "",
        decimals: 6,
        supply: "",
      });

    } catch (err: any) {
      console.error("Token creation error:", err);
      let errorMessage = "Unknown error occurred";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.toString) {
        errorMessage = err.toString();
      }
      
      setStatus(`❌ Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Mint Your Own Token
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Token Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Token Name
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="My Amazing Token"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Symbol */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Symbol
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
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Decimals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Decimals
          </label>
          <input
            type="number"
            name="decimals"
            value={form.decimals}
            onChange={handleChange}
            min={0}
            max={9}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Supply */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Supply
          </label>
          <input
            type="number"
            name="supply"
            value={form.supply}
            onChange={handleChange}
            placeholder="1000000"
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !wallet.connected}
          className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? "Creating Token..." : wallet.connected ? "Mint Token" : "Connect Wallet First"}
        </button>
      </form>

      {status && (
        <div className="mt-4 p-3 rounded-xl bg-gray-50">
          <p className="text-center text-sm font-medium whitespace-pre-line break-words">
            {status}
          </p>
        </div>
      )}
    </div>
  );
}