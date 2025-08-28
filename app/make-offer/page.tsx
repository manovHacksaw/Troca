
"use client"
import MakeOfferForm from "@/components/make-offer-form";
import { useProgram } from "@/hooks/use-program";
import { PublicKey } from "@solana/web3.js";


export default function Page() {
  const { makeOffer } = useProgram();

  return (
    <div className="flex justify-center mt-10">
      <MakeOfferForm
        onSubmit={({ id, tokenMintA, tokenMintB, tokenAOfferedAmount, tokenBWantedAmount }) => {
          makeOffer(
            id,
            new PublicKey(tokenMintA),
            new PublicKey(tokenMintB),
            tokenAOfferedAmount,
            tokenBWantedAmount
          )
            .then((sig) => console.log("Tx signature:", sig))
            .catch((err) => console.error(err));
        }}
      />
    </div>
  );
}
