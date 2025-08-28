import idl from "../solana-swap/target/idl/solana_swap.json";
import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";


const programId = new PublicKey("Edz9ryDesBvtvwvnxCQpRfqgcW4Wf8MvLec8hbcNH6RV");
const endpoint = clusterApiUrl("devnet");
const connection = new anchor.web3.Connection(endpoint, "processed");

export const getProgram = (wallet: anchor.Wallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
//   return new anchor.Program(idl as anchor.Idl, programId, provider);
};

