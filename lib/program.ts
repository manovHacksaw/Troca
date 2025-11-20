import { clusterApiUrl, PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";


const programId = new PublicKey("Edz9ryDesBvtvwvnxCQpRfqgcW4Wf8MvLec8hbcNH6RV");
const endpoint = clusterApiUrl("devnet");
const connection = new anchor.web3.Connection(endpoint, "processed");

export const getProgram = async (wallet: anchor.Wallet) => {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });
  const idl = await anchor.Program.fetchIdl(programId, provider);
  if (!idl) {
    throw new Error("Program IDL not found on chain");
  }
  const idlWithAddress = {
    ...idl,
    address: idl.address ?? programId.toBase58(),
  };
  return new anchor.Program(idlWithAddress, provider);
};

