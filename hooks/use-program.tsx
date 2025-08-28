"use client"
import { PublicKey } from "@solana/web3.js";
import idl from "../solana-swap/target/idl/solana_swap.json";
import {SolanaSwap} from "../solana-swap/target/types/solana_swap";
import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";

export function useProgram(){
  const PROGRAM_ID = new PublicKey("A4xcEpdNUkcycpmMekrGE3jWKQket1fnsWhNVh5G5LG8");
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

    const program = useMemo(() => {
    if (provider) {
      return new anchor.Program(idl as SolanaSwap, provider);
    }
    
    return null;
  }, [provider]);

  // make offer function
  const makeOffer = async(
    id: number, 
    tokenMintA: PublicKey,
    tokenMintB: PublicKey,
    offeredAmount: number,
    wantedAmount: number,
  ) =>{
       if (!program || !publicKey) throw new Error("Wallet not connected");

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
      .makeOffer(new anchor.BN(id), new anchor.BN(offeredAmount), new anchor.BN(wantedAmount))
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
  const takeOffer = async(offerId: number, maker: PublicKey) => {
    if (!program || !publicKey) throw new Error("Wallet not connected");

    const [offerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("offer"), maker.toBuffer(), new anchor.BN(offerId).toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    // Fetch offer data to get token mints
    const offerAccount = await program.account.offer.fetch(offerPda);

    const takerTokenAccountA = getAssociatedTokenAddress(
      offerAccount.tokenMintA, publicKey, false, TOKEN_PROGRAM_ID
    );

    const takerTokenAccountB = getAssociatedTokenAddress(
      offerAccount.tokenMintB, publicKey, false, TOKEN_PROGRAM_ID
    );

    const makerTokenAccountB = getAssociatedTokenAddress(
      offerAccount.tokenMintB, maker, false, TOKEN_PROGRAM_ID
    );

    const vault = getAssociatedTokenAddress(
      offerAccount.tokenMintA, offerPda, true, TOKEN_PROGRAM_ID
    );

    const tx = await program.methods
      .takeOffer()
      .accounts({
        taker: publicKey,
        maker: maker,
        tokenMintA: offerAccount.tokenMintA,
        tokenMintB: offerAccount.tokenMintB,
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

  try {
    const offers = await program.account.offer.all();
    console.log("raw offers", offers);

    offers.map((offer) => {
      console.log("ID/PDA", offer.publicKey.toBase58());
      console.log("Maker: ", offer.account.maker.toBase58());
      console.log("Token B Wanted Amount: ", offer.account.tokenBWantedAmount.toNumber());
      console.log(" Offered Token (A): ", offer.account.tokenMintA.toBase58());
      console.log(" Wanted Token (B): ", offer.account.tokenMintB.toBase58());
    })

    const parsed = offers.map((offer) => ({
      publicKey: offer.publicKey.toBase58(),
      maker: offer.account.maker.toBase58(),
      tokenMintA: offer.account.tokenMintA.toBase58(),
      tokenMintB: offer.account.tokenMintB.toBase58(),
      offeredAmount: offer.account.offeredAmount.toNumber(),
      wantedAmount: offer.account.wantedAmount.toNumber(),
      isActive: offer.account.isActive, // if you have a flag
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
