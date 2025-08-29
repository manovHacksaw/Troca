import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Metaplex } from "@metaplex-foundation/js";

interface TokenRow {
  mint: string;
  amount: number;
  decimals: number;
  name?: string;
  symbol?: string;
  image?: string;
}

export default function MyTokens() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokens, setTokens] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!wallet.publicKey) return;
      setLoading(true);
      try {
        const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const basic = accounts.value
          .map((acc) => {
            const info = acc.account.data.parsed.info;
            return {
              mint: info.mint as string,
              amount: info.tokenAmount.uiAmount ?? 0,
              decimals: info.tokenAmount.decimals as number,
            } as TokenRow;
          })
          .filter((t) => t.amount > 0);

        const mx = Metaplex.make(connection);

        const enriched = await Promise.all(
          basic.map(async (t) => {
            try {
              const mintPk = new PublicKey(t.mint);
              const asset = await mx.nfts().findByMint({ mintAddress: mintPk });
              let image: string | undefined = undefined;
              if (asset.json?.image) image = String(asset.json.image);
              else if (asset.uri) {
                try {
                  const res = await fetch(asset.uri);
                  const data = await res.json();
                  image = data?.image as string | undefined;
                } catch {}
              }
              return {
                ...t,
                name: asset.name || t.mint.slice(0, 8),
                symbol: (asset as any).symbol || undefined,
                image,
              } as TokenRow;
            } catch (_) {
              return {
                ...t,
                name: `Custom Token ${t.mint.slice(0, 8)}`,
                symbol: undefined,
                image: undefined,
              } as TokenRow;
            }
          })
        );

        setTokens(enriched);
      } catch (e) {
        console.error("Error fetching tokens:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, [wallet.publicKey, connection]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">My Tokens</h2>
      {!wallet.connected ? (
        <p>Connect wallet to view tokens.</p>
      ) : loading ? (
        <p>Loading...</p>
      ) : tokens.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <ul className="space-y-2">
          {tokens.map((t, i) => (
            <li key={i} className="flex items-center gap-3 p-3 border rounded-xl">
              {t.image ? (
                <img
                  src={t.image}
                  alt={t.name || t.mint}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-200 grid place-items-center text-sm">🪙</div>
              )}
              <div className="flex-1">
                <div className="font-semibold">
                  {t.name || t.mint.slice(0, 8)} {t.symbol ? <span className="text-gray-500">({t.symbol})</span> : null}
                </div>
                <div className="text-sm text-gray-600">Mint: {t.mint}</div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{t.amount}</div>
                <div className="text-sm text-gray-600">Decimals: {t.decimals}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
