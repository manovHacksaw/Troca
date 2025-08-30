"use client"
import { useEffect, useState } from "react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey } from "@solana/web3.js"
import { Metaplex } from "@metaplex-foundation/js"
import { Button } from "@/components/ui/button"

interface TokenInfo {
  mint: string
  amount: number
  decimals: number
  symbol?: string
  name?: string
  image?: string
}

export default function MyTokensPage() {
  const { connection } = useConnection()
  const wallet = useWallet()
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("")

  useEffect(() => {
    fetchTokens()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.publicKey, connection])

  const fetchTokens = async () => {
    if (!wallet.publicKey) return
    setLoading(true)
    try {
      const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
      })

      const tokenList = accounts.value
        .map((acc) => {
          const info = acc.account.data.parsed.info
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount || 0,
            decimals: info.tokenAmount.decimals,
          }
        })
        .filter((t) => t.amount > 0)

      const baseList = tokenList.map((t) => ({
        ...t,
        symbol: getTokenSymbol(t.mint),
        name: getTokenName(t.mint),
        image: undefined as string | undefined,
      }))

      const mx = Metaplex.make(connection)
      const enriched = await Promise.all(
        baseList.map(async (t) => {
          try {
            const nft = await mx.nfts().findByMint({ mintAddress: new PublicKey(t.mint) })
            let image: string | undefined
            if (nft?.jsonLoaded) {
              image = (nft.json as any)?.image || undefined
            } else if (nft?.uri) {
              const res = await fetch(nft.uri)
              const j = await res.json().catch(() => null)
              image = j?.image
            }
            return {
              ...t,
              symbol: nft?.symbol || t.symbol,
              name: nft?.name || t.name,
              image,
            } as TokenInfo
          } catch {
            return t as TokenInfo
          }
        }),
      )

      setTokens(enriched)
    } catch (e) {
      console.error("Error fetching tokens:", e)
    } finally {
      setLoading(false)
    }
  }

  const getTokenSymbol = (mint: string): string => {
    const known: Record<string, string> = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USDC",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "USDT",
      So11111111111111111111111111111111111111112: "SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "mSOL",
    }
    return known[mint] || `TKN_${mint.slice(0, 4)}`
  }

  const getTokenName = (mint: string): string => {
    const known: Record<string, string> = {
      EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: "USD Coin",
      Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: "Tether USD",
      So11111111111111111111111111111111111111112: "Wrapped SOL",
      mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So: "Marinade SOL",
    }
    return known[mint] || `Custom Token`
  }

  const truncate = (address: string) => `${address.slice(0, 6)}...${address.slice(-6)}`
  const copy = (text: string) => navigator.clipboard.writeText(text)

  const filtered = tokens.filter(
    (t) =>
      t.symbol?.toLowerCase().includes(filter.toLowerCase()) ||
      t.name?.toLowerCase().includes(filter.toLowerCase()) ||
      t.mint.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-5 py-8 md:py-10">
      <div className="mb-6 text-center">
        <h1 className="text-balance text-3xl md:text-4xl font-semibold">My Tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your token portfolio</p>
      </div>

      {!wallet.connected ? (
        <div className="mx-auto max-w-md rounded-xl border border-border bg-secondary/30 p-5 text-center">
          <h2 className="font-medium">Wallet not connected</h2>
          <p className="text-sm text-muted-foreground">Connect your wallet to view your tokens</p>
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Filter</label>
                <input
                  type="text"
                  placeholder="Search tokens..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full md:w-64 rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={fetchTokens} disabled={loading}>
                  {loading ? "Loading..." : "Refresh"}
                </Button>
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-secondary/30 p-6 text-center">
              <h2 className="font-medium">
                {loading ? "Loading tokens..." : tokens.length === 0 ? "No tokens found" : "No matching tokens"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tokens.length === 0 ? "Mint a token to get started" : "Try adjusting your search filter"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((t) => (
                <div key={t.mint} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-4 text-center">
                    <div className="mb-3 flex items-center justify-center">
                      {t.image ? (
                        <img
                          src={t.image || "/placeholder.svg"}
                          alt={t.symbol || "token"}
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full border border-border bg-muted" />
                      )}
                    </div>
                    <div className="inline-block rounded bg-primary/10 px-3 py-1">
                      <span className="text-sm font-semibold text-primary">{t.symbol}</span>
                    </div>
                    {t.name && <div className="mt-1 text-sm text-muted-foreground">{t.name}</div>}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-semibold">{t.amount.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Balance</div>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Decimals</span>
                        <span>{t.decimals}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-muted-foreground">Mint</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{truncate(t.mint)}</span>
                          <button onClick={() => copy(t.mint)} className="text-xs text-primary hover:opacity-80">
                            Copy mint
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
