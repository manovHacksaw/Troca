"use client"
import MintTokenForm from '@/components/mint-token-form'
import MyTokens from '@/components/my-tokens'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import React from 'react'

const page = () => {
  return (
    <div>
      <WalletMultiButton/>

      <div>
        <MintTokenForm/>
      </div>
      <div>
        <MyTokens/>
      </div>
    </div>
  )
}

export default page