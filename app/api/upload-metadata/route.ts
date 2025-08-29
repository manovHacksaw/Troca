// app/api/upload-metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, symbol, image, description, decimals } = body;

    if (!name || !symbol) {
      return NextResponse.json({ error: 'Name and symbol are required' }, { status: 400 });
    }

    const token = process.env.NEXT_PUBLIC_PINATA_JWT;
    if (!token) {
      return NextResponse.json({ error: 'Pinata JWT not configured' }, { status: 500 });
    }

    const metadata = {
      name,
      symbol: symbol.toUpperCase(),
      image,
      description: description || `${name} — minted on Troca`,
      decimals: Number(decimals) || 6,
    };

    const pinataBody = {
      pinataMetadata: {
        name: `${symbol.toUpperCase()}-metadata.json`,
      },
      pinataContent: metadata,
    };

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pinataBody),
    });

    const json = await response.json();
    
    if (!response.ok) {
      throw new Error(json?.error || 'Pinata upload failed');
    }

    const cid = json?.IpfsHash;
    if (!cid) {
      throw new Error('No IPFS hash returned from Pinata');
    }

    return NextResponse.json({ 
      success: true, 
      cid,
      metadataUrl: `https://ipfs.io/ipfs/${cid}`,
      metadata 
    });

  } catch (error: any) {
    console.error('Metadata upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload metadata' }, 
      { status: 500 }
    );
  }
}