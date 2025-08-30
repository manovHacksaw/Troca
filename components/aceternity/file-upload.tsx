"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export interface FileUploadResult {
  url: string;
  cid?: string;
  name?: string;
  size?: number;
  type?: string;
}

export function FileUpload({
  label = "Upload Icon",
  onUploaded,
  className = "",
  accept = "image/*",
}: {
  label?: string;
  onUploaded?: (r: FileUploadResult) => void;
  className?: string;
  accept?: string;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFiles = (files?: FileList | null) => {
    if (!files || !files[0]) return;
    const f = files[0];
    setError(null);
    setFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const uploadToPinata = async (f: File): Promise<FileUploadResult> => {
    const jwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!jwt) {
      throw new Error("Missing NEXT_PUBLIC_PINATA_JWT");
    }
    const form = new FormData();
    form.append("file", f, f.name);
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: { Authorization: `Bearer ${jwt}` },
      body: form,
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Pinata upload failed: ${txt}`);
    }
    const json = await res.json();
    const hash: string | undefined = json?.IpfsHash;
    if (!hash) throw new Error("Invalid response from Pinata");
    return {
      url: `https://gateway.pinata.cloud/ipfs/${hash}`,
      cid: hash,
      name: f.name,
      size: f.size,
      type: f.type,
    };
  };

  const upload = useCallback(async () => {
    if (!file) return;
    try {
      setUploading(true);
      const result = await uploadToPinata(file);
      onUploaded?.(result);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setUploading(false);
    }
  }, [file, onUploaded]);

  const [manualUrl, setManualUrl] = useState("");
  const commitManualUrl = () => {
    if (!manualUrl) return;
    const result: FileUploadResult = { url: manualUrl };
    onUploaded?.(result);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`relative grid place-items-center gap-3 rounded-xl border border-[var(--border)] p-6 text-center ${
          dragOver ? "bg-[#111213]" : "bg-[#0F0F0F]"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        {preview ? (
          <img
            src={preview}
            alt="preview"
            className="size-20 rounded-lg object-cover"
            style={{ imageRendering: "pixelated" }}
          />
        ) : (
          <div className="size-20 rounded-lg bg-[#111213] grid place-items-center text-2xl border border-[var(--border)] text-zinc-500">
            🖼️
          </div>
        )}
        <div className="space-y-1">
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-zinc-400">PNG, JPG, GIF up to 5MB</div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-1.5 text-xs font-medium hover:opacity-90"
          >
            Choose File
          </button>
          <button
            type="button"
            onClick={upload}
            disabled={!file || uploading}
            className="rounded-md border border-[var(--border)] bg-[#0F0F0F] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload to IPFS"}
          </button>
        </div>
        {uploading && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-white/5"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        )}
      </div>

      {error && (
        <div className="rounded-md border border-amber-700/40 bg-amber-900/20 p-3 text-xs text-amber-200">
          {error} – Ensure NEXT_PUBLIC_PINATA_JWT is set. Alternatively, paste an image URL below.
        </div>
      )}
      <div className="flex items-center gap-2">
        <input
          type="url"
          placeholder="https://... (image URL)"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          className="flex-1 rounded-md border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500"
        />
        <button
          type="button"
          onClick={commitManualUrl}
          className="rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] px-3 py-2 text-xs font-medium hover:opacity-90"
        >
          Use URL
        </button>
      </div>
    </div>
  );
}

export default FileUpload;
