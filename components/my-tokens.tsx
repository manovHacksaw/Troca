"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TokenInfo {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  name?: string;
  image?: string;
}

export default function MyTokensPage() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchTokens();
  }, [wallet.publicKey, connection]);

  const fetchTokens = async () => {
    if (!wallet.publicKey) return;

    setLoading(true);
    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      });

      const tokenList = accounts.value
        .map((acc) => {
          const info = acc.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount || 0,
            decimals: info.tokenAmount.decimals,
          };
        })
        .filter((token) => token.amount > 0);

      const baseList = tokenList.map((token) => ({
        ...token,
        symbol: getTokenSymbol(token.mint),
        name: getTokenName(token.mint),
        image: undefined as string | undefined,
      }));

      const mx = Metaplex.make(connection);
      const enriched = await Promise.all(
        baseList.map(async (t) => {
          try {
            const nft = await mx.nfts().findByMint({ mintAddress: new PublicKey(t.mint) });
            let image: string | undefined;
            if (nft?.jsonLoaded) {
              image = (nft.json as any)?.image || undefined;
            } else if (nft?.uri) {
              const res = await fetch(nft.uri);
              const j = await res.json().catch(() => null);
              image = j?.image;
            }
            return {
              ...t,
              symbol: nft?.symbol || t.symbol,
              name: nft?.name || t.name,
              image,
            } as TokenInfo;
          } catch {
            return t as TokenInfo;
          }
        })
      );

      setTokens(enriched);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTokenSymbol = (mint: string): string => {
    const knownTokens: { [key: string]: string } = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
      So11111111111111111111111111111111111111112: "SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL",
    };
    return knownTokens[mint] || `TKN_${mint.slice(0, 4)}`;
  };

  const getTokenName = (mint: string): string => {
    const knownTokens: { [key: string]: string } = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USD Coin",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "Tether USD",
      So11111111111111111111111111111111111111112: "Wrapped SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "Marinade SOL",
    };
    return knownTokens[mint] || `Custom Token ${mint.slice(0, 8)}`;
  };

  const truncateAddress = (address: string) => `${address.slice(0, 8)}...${address.slice(-8)}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol?.toLowerCase().includes(filter.toLowerCase()) ||
      token.name?.toLowerCase().includes(filter.toLowerCase()) ||
      token.mint.toLowerCase().includes(filter.toLowerCase())
  );

  const totalValue = tokens.reduce((sum, token) => sum + token.amount, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-semibold text-white">My Tokens</h1>
        <p className="text-sm text-zinc-400 mt-2">Manage your token portfolio</p>
      </div>

      {!wallet.connected ? (
        <div className="rounded-xl border border-rose-700/40 bg-rose-900/20 p-6 text-center">
          <h2 className="text-rose-300 font-medium mb-2">Wallet not connected</h2>
          <p className="text-sm text-rose-200/80">Connect your wallet to view your tokens</p>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-5 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-semibold text-[var(--primary)]">{tokens.length}</div>
                <div className="text-xs text-zinc-400">Tokens</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-emerald-300">{totalValue.toFixed(2)}</div>
                <div className="text-xs text-zinc-400">Total balance</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-amber-300">{tokens.filter((t) => t.amount > 1000).length}</div>
                <div className="text-xs text-zinc-400">Large bags</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-rose-300">
                  {tokens.filter((t) => (t.symbol?.includes("_") || false)).length}
                </div>
                <div className="text-xs text-zinc-400">Custom</div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[#111213] p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="text-xs text-zinc-400">Filter</label>
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full md:w-64 rounded-lg border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/30 focus:border-[#1E90FF]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchTokens} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </Button>
                <Link href="/mint">
                  <Button variant="secondary">Mint New</Button>
                </Link>
              </div>
            </div>
          </div>

          {filteredTokens.length === 0 ? (
            <div className="rounded-xl border border-amber-700/40 bg-amber-900/20 p-6 text-center">
              <h2 className="text-amber-300 font-medium mb-2">
                {loading ? "Loading tokens..." : tokens.length === 0 ? "No tokens found" : "No matching tokens"}
              </h2>
              <p className="text-sm text-amber-200/80">
                {tokens.length === 0 ? "Start by minting some tokens!" : "Try adjusting your search filter"}
              </p>
              {tokens.length === 0 && (
                <div className="mt-4">
                  <Link href="/mint">
                    <Button>Create first token</Button>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTokens.map((token, index) => (
                <div key={index} className="rounded-xl border border-[var(--border)] bg-[#111213] p-5">
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center mb-3">
                      {token.image ? (
                        <img src={token.image} alt={token.symbol || "token"} className="h-10 w-10 rounded-full object-cover border border-[var(--border)]" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#0F0F0F] border border-[var(--border)]" />)
                      }
                    </div>
                    <div className="inline-block px-3 py-1 mb-2 rounded bg-[var(--primary)]/20 border border-[var(--primary)]/30">
                      <span className="text-[var(--primary)] font-semibold text-base">{token.symbol}</span>
                    </div>
                    <h3 className="text-white font-medium mb-1">{token.name}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-semibold text-emerald-300 mb-1">
                        {token.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-zinc-400">Balance</div>
                    </div>

                    <div className="border-t border-[var(--border)] pt-3 space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Decimals</span>
                        <span className="text-amber-300">{token.decimals}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">Mint</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-zinc-400">{truncateAddress(token.mint)}</span>
                          <button
                            onClick={() => copyToClipboard(token.mint)}
                            className="text-xs text-[var(--primary)] hover:opacity-80"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 space-y-2">
                      <Link href={`/make-offer?tokenA=${token.mint}`}>
                        <Button className="w-full">Make offer</Button>
                      </Link>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => copyToClipboard(token.mint)}
                          className="rounded-md border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-xs text-white hover:bg-[#0F0F0F]/80"
                        >
                          Copy mint
                        </button>
                        <a
                          href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-md border border-[var(--border)] bg-[#0F0F0F] px-3 py-2 text-xs text-white text-center hover:bg-[#0F0F0F]/80"
                        >
                          Explorer
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-xl border border-[var(--border)] bg-[#0F0F0F] p-5 mt-8">
            <h3 className="text-white font-medium mb-4 text-center">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/mint">
                <Button className="w-full">Mint new token</Button>
              </Link>
              <Link href="/make-offer">
                <Button variant="secondary" className="w-full">Create offer</Button>
              </Link>
              <Link href="/offers">
                <Button variant="outline" className="w-full">Browse offers</Button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
