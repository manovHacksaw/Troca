"use client";
import React, { useState } from "react";

interface MakeOfferFormProps {
  onSubmit: (data: {
    id: number;
    tokenMintA: string;
    tokenMintB: string;
    tokenAOfferedAmount: number;
    tokenBWantedAmount: number;
  }) => void;
}

const MakeOfferForm: React.FC<MakeOfferFormProps> = ({ onSubmit }) => {
  const [id, setId] = useState("");
  const [tokenMintA, setTokenMintA] = useState("");
  const [tokenMintB, setTokenMintB] = useState("");
  const [tokenAOfferedAmount, setTokenAOfferedAmount] = useState("");
  const [tokenBWantedAmount, setTokenBWantedAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      id: Number(id),
      tokenMintA,
      tokenMintB,
      tokenAOfferedAmount: Number(tokenAOfferedAmount),
      tokenBWantedAmount: Number(tokenBWantedAmount),
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
