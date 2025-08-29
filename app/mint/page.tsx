"use client";

import { useMemo, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import FileUpload, { FileUploadResult } from "@/components/aceternity/file-upload";
import MultiStep, { Step } from "@/components/aceternity/multi-step-loader";
import Loader from "@/components/aceternity/loader";
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
      { label: "Create Mint", status: "pending" },
      { label: "Mint to Wallet", status: "pending" },
      { label: "Upload Metadata (IPFS)", status: "pending" },
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
    <div className="bg-gradient-to-b from-black via-[#0a0a12] to-black">
      <div className="pixel-container py-10">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h1 className="bg-gradient-to-r from-cyan-400 to-fuchsia-400 bg-clip-text text-3xl font-extrabold text-transparent sm:text-4xl">
              Mint SPL Token
            </h1>
            <p className="mt-2 text-sm text-white/70">Set name, symbol, decimals, supply, and icon.</p>
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.35)]">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5">
              <div>
                <label className="text-xs font-semibold text-white/70">Token Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="My Token"
                  maxLength={32}
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40"
                />
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-white/70">Symbol</label>
                  <input
                    type="text"
                    name="symbol"
                    value={form.symbol}
                    onChange={handleChange}
                    placeholder="TKN"
                    maxLength={10}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm uppercase text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70">Decimals</label>
                  <input
                    type="number"
                    name="decimals"
                    value={form.decimals}
                    onChange={handleChange}
                    min={0}
                    max={9}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-white/70">Initial Supply</label>
                  <input
                    type="number"
                    name="supply"
                    value={form.supply}
                    onChange={handleChange}
                    placeholder="1000000"
                    min={1}
                    required
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-white/70">Token Icon (IPFS)</label>
                <FileUpload onUploaded={onIconUploaded} />
                {form.iconUrl ? (
                  <p className="mt-2 truncate text-xs text-emerald-300">{form.iconUrl}</p>
                ) : (
                  <p className="mt-2 text-xs text-white/50">Optional, improves metadata and UX</p>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || !wallet.connected}
                className="rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? <Loader label="Minting..." /> : wallet.connected ? "Mint Token" : "Connect Wallet"}
              </button>
            </form>

            <div className="mt-6">
              <MultiStep steps={steps} />
            </div>

            {message && (
              <div
                className={`mt-6 rounded-2xl border p-4 text-sm ${
                  messageType === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                    : messageType === "error"
                    ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                    : messageType === "warning"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                }`}
              >
                <pre className="whitespace-pre-wrap break-words">{message}</pre>
              </div>
            )}
          </div>

          <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <Stat label="Network" value="Solana Devnet" />
              <Stat label="Standard" value="SPL Token" />
              <Stat label="Est. Cost" value="~0.002 SOL" />
              <Stat label="Time" value="~5s" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
      <div className="text-xs font-medium text-white/60">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white">{value}</div>
    </div>
  );
}
