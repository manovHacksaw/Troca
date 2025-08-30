"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import FileUpload, { FileUploadResult } from "@/components/aceternity/file-upload";
import MultiStep, { Step } from "@/components/aceternity/multi-step-loader";
import Loader from "@/components/aceternity/loader";
import { Button } from "@/components/ui/button";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createFungible,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo,
  mplToolbox,
} from "@metaplex-foundation/mpl-toolbox";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import { generateSigner, percentAmount } from "@metaplex-foundation/umi";

export default function MintPage() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [form, setForm] = useState({
    name: "",
    symbol: "",
    decimals: 6,
    supply: "",
    iconUrl: "",
  });
  const [steps, setSteps] = useState<Step[]>([
    { label: "Upload Metadata", status: "pending" },
    { label: "Create Mint", status: "pending" },
    { label: "Mint to Wallet", status: "pending" },
  ]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | "warning" | "info">("info");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onIconUploaded = (r: FileUploadResult) => {
    setForm((s) => ({ ...s, iconUrl: r.url }));
  };

  const resetSteps = () =>
    setSteps([
      { label: "Upload Metadata", status: "pending" },
      { label: "Create Mint", status: "pending" },
      { label: "Mint to Wallet", status: "pending" },
    ]);

  const setStep = (i: number, status: Step["status"]) =>
    setSteps((prev) => prev.map((s, idx) => (idx === i ? { ...s, status } : s)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!wallet.connected || !wallet.publicKey) {
      setMessage("Connect your wallet first");
      setMessageType("error");
      return;
    }

    if (!form.name.trim() || !form.symbol.trim() || !form.supply.trim()) {
      setMessage("Fill all required fields");
      setMessageType("error");
      return;
    }

    const supplyUi = Number(form.supply);
    const decimals = Number(form.decimals);
    if (!Number.isFinite(supplyUi) || supplyUi <= 0) {
      setMessage("Supply must be a positive number");
      setMessageType("error");
      return;
    }

    resetSteps();
    setBusy(true);
    setMessage("Processing...");
    setMessageType("info");

    try {
      // 1) Upload metadata JSON (uses NFT.Storage) to get a URI
      setStep(0, "active");
      let metadataUri = "";
      const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
      const jsonBody = {
        name: form.name,
        symbol: form.symbol.toUpperCase(),
        description: `${form.name} — minted on Troca`,
        image: form.iconUrl || undefined,
      } as Record<string, any>;
      if (pinataJwt) {
        const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
          method: "POST",
          headers: { Authorization: `Bearer ${pinataJwt}`, "Content-Type": "application/json" },
          body: JSON.stringify(jsonBody),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message || "Pinata JSON upload failed");
        const hash = json?.IpfsHash as string | undefined;
        if (!hash) throw new Error("Invalid response from Pinata");
        metadataUri = `https://gateway.pinata.cloud/ipfs/${hash}`;
      } else {
        metadataUri = "";
      }
      setStep(0, "complete");

      // 2) Create mint + Token Metadata on-chain using Umi
      setStep(1, "active");
      const umi = createUmi("https://api.devnet.solana.com")
        .use(mplTokenMetadata())
        .use(mplToolbox())
        .use(walletAdapterIdentity(wallet));

      const mintSigner = generateSigner(umi);
      const createFungibleIx = createFungible(umi, {
        mint: mintSigner,
        name: form.name,
        symbol: form.symbol.toUpperCase(),
        uri: metadataUri,
        sellerFeeBasisPoints: percentAmount(0),
        decimals,
      });

      const ataIx = createTokenIfMissing(umi, {
        mint: mintSigner.publicKey,
        owner: umi.identity.publicKey,
        ataProgram: getSplAssociatedTokenProgramId(umi),
      });

      // 3) Mint initial supply to wallet (convert UI units to base units)
      setStep(2, "active");
      const baseAmount = BigInt(Math.floor(supplyUi * Math.pow(10, decimals)));
      const mintToIx = mintTokensTo(umi, {
        mint: mintSigner.publicKey,
        token: findAssociatedTokenPda(umi, {
          mint: mintSigner.publicKey,
          owner: umi.identity.publicKey,
        }),
        amount: baseAmount,
      });

      const tx = await createFungibleIx.add(ataIx).add(mintToIx).sendAndConfirm(umi);
      setStep(1, "complete");
      setStep(2, "complete");

      const sig = tx.signature ? (Array.isArray(tx.signature) ? tx.signature[0] : tx.signature) : undefined;
      const explorer = sig ? `https://explorer.solana.com/tx/${sig}?cluster=devnet` : "";
      setMessage([
        `Mint created successfully`,
        explorer && `Explorer: ${explorer}`,
        `Mint Address: ${mintSigner.publicKey}`,
        pinataJwt ? (metadataUri && `Metadata URI: ${metadataUri}`) : `Metadata upload skipped (set NEXT_PUBLIC_PINATA_JWT to enable).`,
      ].filter(Boolean).join("\n"));
      setMessageType("success");

      setForm({ name: "", symbol: "", decimals: 6, supply: "", iconUrl: "" });
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || String(err));
      setMessageType("error");
      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.status !== "complete");
        if (idx >= 0) prev[idx] = { ...prev[idx], status: "error" } as Step;
        return [...prev];
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">Mint SPL Token</h1>
        <p className="mt-2 text-sm text-zinc-400">Set name, symbol, decimals, supply, and icon.</p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-6">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
          <div>
            <label className="text-xs font-medium text-zinc-400">Token Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="My Token"
              maxLength={32}
              required
              className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
            />
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div>
              <label className="text-xs font-medium text-zinc-400">Symbol</label>
              <input
                type="text"
                name="symbol"
                value={form.symbol}
                onChange={handleChange}
                placeholder="TKN"
                maxLength={10}
                required
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm uppercase text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Decimals</label>
              <input
                type="number"
                name="decimals"
                value={form.decimals}
                onChange={handleChange}
                min={0}
                max={9}
                required
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-zinc-400">Initial Supply</label>
              <input
                type="number"
                name="supply"
                value={form.supply}
                onChange={handleChange}
                placeholder="1000000"
                min={1}
                required
                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400">Token Icon (IPFS)</label>
            <FileUpload onUploaded={onIconUploaded} />
            {form.iconUrl ? (
              <p className="mt-2 truncate text-xs text-emerald-300">{form.iconUrl}</p>
            ) : (
              <p className="mt-2 text-xs text-zinc-500">Optional, improves metadata and UX</p>
            )}
          </div>

          <Button type="submit" disabled={busy || !wallet.connected} className="w-full sm:w-auto">
            {busy ? <Loader label="Minting..." /> : wallet.connected ? "Mint Token" : "Connect Wallet"}
          </Button>
        </form>

        <div className="mt-6">
          <MultiStep steps={steps} />
        </div>

        {message && (
          <div
            className={`mt-6 rounded-lg border p-4 text-sm ${
              messageType === "success"
                ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-200"
                : messageType === "error"
                ? "border-rose-700/40 bg-rose-900/20 text-rose-200"
                : messageType === "warning"
                ? "border-amber-700/40 bg-amber-900/20 text-amber-200"
                : "border-cyan-700/40 bg-cyan-900/20 text-cyan-200"
            }`}
          >
            <pre className="whitespace-pre-wrap break-words">{message}</pre>
          </div>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-[var(--border)] bg-[#111213] p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Stat label="Network" value="Solana Devnet" />
          <Stat label="Standard" value="SPL Token" />
          <Stat label="Est. Cost" value="~0.002 SOL" />
          <Stat label="Time" value="~5s" />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[#0F0F0F] p-4">
      <div className="text-xs font-medium text-zinc-400">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
