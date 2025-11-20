"use client"
import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useEffect, useMemo, useState } from "react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, getMint } from "@solana/spl-token";

const PROGRAM_ID = new PublicKey("CDnPGAFt6zbNXrYqkJW34BjAvqV2JJBY3UjiLWmQyd1R");

export function useProgram(){
    const {connection} = useConnection();
    const {publicKey} = useWallet();
    const wallet = useAnchorWallet();

      const provider = useMemo(() => {
    if (wallet && connection) {
      const provider = new anchor.AnchorProvider(connection, wallet, {
        commitment: "confirmed",
      });
      anchor.setProvider(provider);
      return provider;
    }
    return null;
  }, [connection, wallet]);

    const [program, setProgram] = useState<anchor.Program | null>(null);

    useEffect(() => {
    let isMounted = true;

    const loadProgram = async () => {
      if (!provider) {
        setProgram(null);
        return;
      }

      try {
        const fetchedIdl = await anchor.Program.fetchIdl(PROGRAM_ID, provider);
        if (fetchedIdl && isMounted) {
          const idlWithAddress = {
            ...fetchedIdl,
            address: fetchedIdl.address ?? PROGRAM_ID.toBase58(),
          };
          setProgram(new anchor.Program(idlWithAddress, provider));
        }
      } catch (error) {
        console.error("Failed to fetch program IDL:", error);
        if (isMounted) {
          setProgram(null);
        }
      }
    };

    loadProgram();

    return () => {
      isMounted = false;
    };
  }, [provider]);

  // make offer function
  const makeOffer = async(
    id: number,
    tokenMintA: PublicKey,
    tokenMintB: PublicKey,
    offeredAmount: number,
    wantedAmount: number,
    expiresAt: number,
  ) =>{
       if (!program || !publicKey) throw new Error("Wallet not connected");

       // Fetch mint info to get token decimals
       const mintAInfo = await getMint(connection, tokenMintA);
       const mintBInfo = await getMint(connection, tokenMintB);

       // Convert UI amounts to token amounts (multiply by 10^decimals)
       const tokenAAmount = Math.floor(offeredAmount * Math.pow(10, mintAInfo.decimals));
       const tokenBAmount = Math.floor(wantedAmount * Math.pow(10, mintBInfo.decimals));

       console.log(`Converting amounts:
         Token A (offered): ${offeredAmount} UI -> ${tokenAAmount} tokens (${mintAInfo.decimals} decimals)
         Token B (wanted): ${wantedAmount} UI -> ${tokenBAmount} tokens (${mintBInfo.decimals} decimals)`);

       const [offerPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("offer"), publicKey.toBuffer(),  new anchor.BN(id).toArrayLike(Buffer, "le", 8)], program.programId,
       )

       const makerTokenAccountA = getAssociatedTokenAddress(
        tokenMintA, publicKey, false, TOKEN_PROGRAM_ID
       );

       const vault = getAssociatedTokenAddress(
        tokenMintA, offerPda, true, TOKEN_PROGRAM_ID
       )

       console.log(program.programId.toBase58());

       const tx = await program.methods
      .makeOffer(new anchor.BN(id), new anchor.BN(tokenAAmount), new anchor.BN(tokenBAmount), new anchor.BN(expiresAt))
      .accounts({
        maker: publicKey,
        tokenMintA,
        tokenMintB,
        makerTokenAccountA,
        offer: offerPda,
        vault,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      })
      .rpc();

    console.log("✅ makeOffer tx:", tx);
    return tx;
  };

  // take offer function
// take offer function
const takeOffer = async (offerId: number, maker: PublicKey) => {
  if (!program || !publicKey || !wallet) throw new Error("Wallet not connected");

  const offerClient = (program.account as any).offer;

  const [offerPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("offer"), maker.toBuffer(), new anchor.BN(offerId).toArrayLike(Buffer, "le", 8)],
    program.programId
  );

  // Fetch offer data to get token mints
  const offerAccount = await offerClient.fetch(offerPda);

  // The taker is RECEIVING token A.
  // Use getOrCreate... to ensure their token account exists.
 const takerTokenAccountA = await getAssociatedTokenAddress(
  offerAccount.tokenMintA,
  publicKey
);


  // The taker is SENDING token B.
  // We just need the address. The transaction will fail if the account
  // doesn't exist or has an insufficient balance, which is correct.
  const takerTokenAccountB = await getAssociatedTokenAddress(
    offerAccount.tokenMintB,
    publicKey
  );

  // The original maker is RECEIVING token B.
  // Use getOrCreate... to ensure their token account exists.
  const makerTokenAccountB = await getAssociatedTokenAddress(
  offerAccount.tokenMintB,
  maker
);


  const vault = await getAssociatedTokenAddress(
    offerAccount.tokenMintA, offerPda, true
  );

  const tx = await program.methods
    .takeOffer()
    .accounts({
      taker: publicKey,
      maker: maker,
      tokenMintA: offerAccount.tokenMintA,
      tokenMintB: offerAccount.tokenMintB,
      // Use the .address property from the created/fetched accounts
      takerTokenAccountA,
      takerTokenAccountB,
      makerTokenAccountB,
      offer: offerPda,
      vault,
      systemProgram: anchor.web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    })
    .rpc();

  console.log("✅ takeOffer tx:", tx);
  return tx;
};

  // fetch all offers
const fetchOffers = async () => {
  if (!program) throw new Error("Program not initialized");

  const offerClient = (program.account as any).offer;
  try {
    const offers = await offerClient.all();
    console.log("raw offers", offers);

    // Process offers and convert amounts to UI format
    const parsed = await Promise.all(offers.map(async (offer: any) => {
      try {
        // Fetch mint info to get decimals for conversion
        const mintAInfo = await getMint(connection, offer.account.tokenMintA);
        const mintBInfo = await getMint(connection, offer.account.tokenMintB);

        // Convert token amounts back to UI amounts (divide by 10^decimals)
        const offeredAmountInDecimals = offer.account.tokenAOfferedAmount.toNumber() / Math.pow(10, mintAInfo.decimals);
        const wantedAmountInDecimals = offer.account.tokenBWantedAmount.toNumber() / Math.pow(10, mintBInfo.decimals);

        console.log("ID/PDA", offer.publicKey.toBase58());
        console.log("Maker: ", offer.account.maker.toBase58());
        console.log("Offered Token (A): ", offer.account.tokenMintA.toBase58());
        console.log("Wanted Token (B): ", offer.account.tokenMintB.toBase58());
        console.log(`Token A Offered Amount: ${offer.account.tokenAOfferedAmount.toNumber()} lamports -> ${offeredAmountInDecimals} (${mintAInfo.decimals} decimals)`);
        console.log(`Token B Wanted Amount: ${offer.account.tokenBWantedAmount.toNumber()} lamports -> ${wantedAmountInDecimals} (${mintBInfo.decimals} decimals)`);
        console.log("Expires At: ", new Date(offer.account.expiresAt.toNumber() * 1000).toISOString());

        return {
          publicKey: offer.publicKey.toBase58(),
          maker: offer.account.maker.toBase58(),
          tokenMintA: offer.account.tokenMintA.toBase58(),
          tokenMintB: offer.account.tokenMintB.toBase58(),
          offeredAmount: offeredAmountInDecimals,
          wantedAmount: wantedAmountInDecimals,
          expiresAt: offer.account.expiresAt.toNumber(),
          id: offer.account.id.toNumber(),
          // Additional info for debugging
          tokenADecimals: mintAInfo.decimals,
          tokenBDecimals: mintBInfo.decimals,
          rawOfferedAmount: offer.account.tokenAOfferedAmount.toNumber(),
          rawWantedAmount: offer.account.tokenBWantedAmount.toNumber(),
        };
      } catch (error) {
        console.error("Error processing offer:", error);
        // Return raw values if conversion fails
        return {
          publicKey: offer.publicKey.toBase58(),
          maker: offer.account.maker.toBase58(),
          tokenMintA: offer.account.tokenMintA.toBase58(),
          tokenMintB: offer.account.tokenMintB.toBase58(),
          offeredAmount: offer.account.tokenAOfferedAmount.toNumber(),
          wantedAmount: offer.account.tokenBWantedAmount.toNumber(),
          expiresAt: offer.account.expiresAt.toNumber(),
          id: offer.account.id.toNumber(),
          tokenADecimals: 0,
          tokenBDecimals: 0,
          rawOfferedAmount: offer.account.tokenAOfferedAmount.toNumber(),
          rawWantedAmount: offer.account.tokenBWantedAmount.toNumber(),
        };
      }
    }));

    console.log("✅ Offers fetched:", parsed);
    return parsed;
  } catch (error) {
    console.error("❌ Error fetching offers:", error);
    return [];
  }
};


  return { program, makeOffer, takeOffer, fetchOffers };
}
