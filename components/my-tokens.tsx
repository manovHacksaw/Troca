import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {  PublicKey } from "@solana/web3.js";

export default function MyTokens() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [tokens, setTokens] = useState<any[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      if (!wallet.publicKey) return;

      const accounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
        programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"), // SPL Token Program
      });

      const tokenList = accounts.value.map(acc => {
        const info = acc.account.data.parsed.info;
        return {
          mint: info.mint,
          amount: info.tokenAmount.uiAmount,
          decimals: info.tokenAmount.decimals,
        };
      });

      setTokens(tokenList);
    };

    fetchTokens();
  }, [wallet.publicKey, connection]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3">My Tokens</h2>
      {tokens.length === 0 ? (
        <p>No tokens found.</p>
      ) : (
        <ul className="space-y-2">
          {tokens.map((t, i) => (
            <li key={i} className="p-3 border rounded-xl">
              <p><b>Mint:</b> {t.mint}</p>
              <p><b>Balance:</b> {t.amount}</p>
              <p><b>Decimals:</b> {t.decimals}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
