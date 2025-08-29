"use client";
import React, { useState } from "react";

interface MakeOfferFormProps {
  onSubmit: (data: {
    id: number;
    tokenMintA: string;
    tokenMintB: string;
    tokenAOfferedAmount: number; // UI amount (e.g., 1.5 tokens)
    tokenBWantedAmount: number;  // UI amount (e.g., 2.0 tokens)
    expiresAt: number;
  }) => void;
}

const MakeOfferForm: React.FC<MakeOfferFormProps> = ({ onSubmit }) => {
  const [id, setId] = useState("");
  const [tokenMintA, setTokenMintA] = useState("");
  const [tokenMintB, setTokenMintB] = useState("");
  const [tokenAOfferedAmount, setTokenAOfferedAmount] = useState("");
  const [tokenBWantedAmount, setTokenBWantedAmount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert expiry date to Unix timestamp (seconds)
    const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);

    onSubmit({
      id: Number(id),
      tokenMintA,
      tokenMintB,
      tokenAOfferedAmount: Number(tokenAOfferedAmount),
      tokenBWantedAmount: Number(tokenBWantedAmount),
      expiresAt: expiryTimestamp,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 border rounded-lg shadow-lg w-96">
      <h2 className="text-xl font-bold text-center">Make Offer</h2>

      <input
        type="number"
        placeholder="Offer ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
        className="p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Token Mint A Address"
        value={tokenMintA}
        onChange={(e) => setTokenMintA(e.target.value)}
        className="p-2 border rounded"
        required
      />

      <input
        type="text"
        placeholder="Token Mint B Address"
        value={tokenMintB}
        onChange={(e) => setTokenMintB(e.target.value)}
        className="p-2 border rounded"
        required
      />

      <input
        type="number"
        placeholder="Amount of Token A to Offer"
        value={tokenAOfferedAmount}
        onChange={(e) => setTokenAOfferedAmount(e.target.value)}
        className="p-2 border rounded"
        required
      />

      <input
        type="number"
        placeholder="Amount of Token B Wanted"
        value={tokenBWantedAmount}
        onChange={(e) => setTokenBWantedAmount(e.target.value)}
        className="p-2 border rounded"
        required
      />

      <input
        type="datetime-local"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        className="p-2 border rounded"
        min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)} // 1 hour from now
        required
      />

      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
      >
        Submit Offer
      </button>
    </form>
  );
};

export default MakeOfferForm;
