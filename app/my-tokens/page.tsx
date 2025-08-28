"use client";

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import Link from "next/link";

interface TokenInfo {
  mint: string;
  amount: number;
  decimals: number;
  symbol?: string;
  name?: string;
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
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
      });

      const tokenList = accounts.value
        .map(acc => {
          const info = acc.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount || 0,
            decimals: info.tokenAmount.decimals,
          };
        })
        .filter(token => token.amount > 0); // Only show tokens with balance

      // Add mock token metadata (in real app, fetch from metadata)
      const tokensWithMetadata = tokenList.map(token => ({
        ...token,
        symbol: getTokenSymbol(token.mint),
        name: getTokenName(token.mint)
      }));

      setTokens(tokensWithMetadata);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTokenSymbol = (mint: string): string => {
    // Mock token symbols - in real app, fetch from metadata
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
    return knownTokens[mint] || `Custom Token ${mint.slice(0, 8)}`;
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: Add toast notification
  };

  const filteredTokens = tokens.filter(token => 
    (token.symbol?.toLowerCase().includes(filter.toLowerCase())) ||
    (token.name?.toLowerCase().includes(filter.toLowerCase())) ||
    token.mint.toLowerCase().includes(filter.toLowerCase())
  );

  const totalValue = tokens.reduce((sum, token) => sum + token.amount, 0);

  return (
    <div className="pixel-container py-8">
      <div className="text-center mb-8">
        <h1 className="pixel-title text-cyan-400 mb-4">MY TOKENS</h1>
        <p className="pixel-text text-gray-300 mb-6">
          MANAGE YOUR TOKEN PORTFOLIO
        </p>
      </div>

      {!wallet.connected ? (
        <div className="pixel-card bg-red-900 border-red-400 text-center">
          <h2 className="pixel-subtitle text-red-400 mb-4">WALLET NOT CONNECTED</h2>
          <p className="pixel-text text-red-200">
            CONNECT YOUR WALLET TO VIEW YOUR TOKENS
          </p>
        </div>
      ) : (
        <>
          {/* Portfolio Stats */}
          <div className="pixel-card bg-purple-900 border-purple-400 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-cyan-400">{tokens.length}</div>
                <div className="pixel-text text-purple-200">TOKENS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">{totalValue.toFixed(2)}</div>
                <div className="pixel-text text-purple-200">TOTAL BALANCE</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-400">
                  {tokens.filter(t => t.amount > 1000).length}
                </div>
                <div className="pixel-text text-purple-200">LARGE BAGS</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {tokens.filter(t => (t.symbol?.includes('_') || false)).length}
                </div>
                <div className="pixel-text text-purple-200">CUSTOM</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="pixel-card bg-blue-900 border-blue-400 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="pixel-text text-blue-200">FILTER:</label>
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pixel-input"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={fetchTokens}
                  disabled={loading}
                  className="pixel-btn-primary"
                >
                  {loading ? "LOADING..." : "REFRESH"}
                </button>
                <Link href="/mint">
                  <button className="pixel-btn-success">
                    MINT NEW
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Token List */}
          {filteredTokens.length === 0 ? (
            <div className="pixel-card bg-yellow-900 border-yellow-400 text-center">
              <h2 className="pixel-subtitle text-yellow-400 mb-4">
                {loading ? "LOADING TOKENS..." : tokens.length === 0 ? "NO TOKENS FOUND" : "NO MATCHING TOKENS"}
              </h2>
              <p className="pixel-text text-yellow-200 mb-4">
                {tokens.length === 0 
                  ? "START BY MINTING SOME TOKENS!"
                  : "TRY ADJUSTING YOUR SEARCH FILTER"
                }
              </p>
              {tokens.length === 0 && (
                <Link href="/mint">
                  <button className="pixel-btn-success">
                    CREATE FIRST TOKEN
                  </button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTokens.map((token, index) => (
                <div key={index} className="pixel-card bg-gray-800 border-gray-400">
                  <div className="text-center mb-4">
                    <div className="pixel-card bg-cyan-600 border-cyan-400 inline-block px-3 py-1 mb-3">
                      <span className="text-black font-bold text-lg">
                        {token.symbol}
                      </span>
                    </div>
                    <h3 className="pixel-subtitle text-cyan-400 mb-2">
                      {token.name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-1">
                        {token.amount.toLocaleString()}
                      </div>
                      <div className="pixel-text text-gray-300">
                        BALANCE
                      </div>
                    </div>

                    <div className="border-t border-gray-600 pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="pixel-text text-gray-300">DECIMALS:</span>
                        <span className="pixel-text text-yellow-400">{token.decimals}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="pixel-text text-gray-300">MINT:</span>
                        <div className="flex items-center gap-2">
                          <span className="pixel-text text-xs text-gray-400">
                            {truncateAddress(token.mint)}
                          </span>
                          <button
                            onClick={() => copyToClipboard(token.mint)}
                            className="pixel-text text-cyan-400 hover:text-cyan-300 text-xs"
                          >
                            📋
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 space-y-2">
                      <Link href={`/make-offer?tokenA=${token.mint}`}>
                        <button className="pixel-btn-primary w-full">
                          MAKE OFFER
                        </button>
                      </Link>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => copyToClipboard(token.mint)}
                          className="pixel-btn-secondary text-xs"
                        >
                          COPY MINT
                        </button>
                        <a
                          href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pixel-btn-secondary text-xs text-center"
                        >
                          EXPLORER
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="pixel-card bg-green-900 border-green-400 mt-8">
            <h3 className="pixel-subtitle text-green-400 mb-4 text-center">
              QUICK ACTIONS
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/mint">
                <button className="pixel-btn-success w-full">
                  ⛏️ MINT NEW TOKEN
                </button>
              </Link>
              <Link href="/make-offer">
                <button className="pixel-btn-primary w-full">
                  🔄 CREATE OFFER
                </button>
              </Link>
              <Link href="/offers">
                <button className="pixel-btn-warning w-full">
                  🛒 BROWSE OFFERS
                </button>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
