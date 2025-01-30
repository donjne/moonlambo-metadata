import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { transferV1 } from '@metaplex-foundation/mpl-core';
import { publicKey, keypairIdentity, some } from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const NFT_MINTS = [
  "J7e5vQdcVbk5m65gYTUYvT3ewZBzsG8kgLd9ZbRK3GTh",
  "5btViSvacRmnprZ2z9fgMvcE7CJaX2YX7JvUWtAvQHYv",
  "D1Cnu1dF98cbCrn4uXzh63JCiCNn2537u2VtbaGHZ9Bv",
  "3eyi7dwBD2moq5j3zmmmt1FoeeyfUST8Kt2YYD6trbMB",
  "E6Zvr6GvUikFBi7LUaKzMXXsBzaMeKm4H4uzcm92utVV",
  "8d86zDhXrBU4RNxEzoixQR2HpxPbSxahhxMgUahFiQTj",
  "8yxAU6iFWffQvkEfGQn2qtUPXVa4hy5RXCP5LvikNyjf",
  "2PJzcP4UaYwDdYXRexq57v3xGobKvrtBbtUU6Zm2bJhK",
  "7XL5QC3gap5Bqqabkj4e48e9hxmyrSKRXkxTKsjxssw",
  "6TKuMWgcQWCYryZmyemK7cNF69MrewdqEZfNPykieyKF"
];

const DESTINATION_ADDRESS = 'AopUFgSHXJmcQARjTJex43NYcaQSMcVWmKtcYybo43Xm'; // Replace with the recipient's address
const COLLECTION_ADDRESS = '9mKksxtbVMcRdpfe9ZJBuuQqShywNfvdyYSkpXSxLms9';

async function transferNFTs() {
  try {
    // Initialize Umi
    const umi = createUmi('https://api.devnet.solana.com')
      .use(web3JsEddsa());

      
    
    // Load wallet
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairFile = JSON.parse(await readFile(keypairPath, 'utf-8'));
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));
    umi.use(keypairIdentity(keypair));

    // Process each NFT transfer
    for (let i = 0; i < NFT_MINTS.length; i++) {
      const mint = NFT_MINTS[i];
      console.log(`Transferring NFT ${i + 1}/${NFT_MINTS.length}: ${mint}`);

      try {
        const tx = await transferV1(umi, {
          asset: publicKey(mint),
          owner: umi.identity,
          destination: publicKey(DESTINATION_ADDRESS),
          collection: publicKey(COLLECTION_ADDRESS),
          amount: 1,
          delegate: some(umi.identity.publicKey), // Optional: if you're using a delegate
        });

        const signature = await tx.sendAndConfirm(umi);
        console.log(`✅ Transfer successful for ${mint}`);
        console.log('Signature:', signature);

        // Optional: Add delay between transactions
        if (i < NFT_MINTS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Failed to transfer ${mint}:`, error);
        // Continue with next NFT even if one fails
      }
    }

    console.log('Transfer process completed!');
  } catch (error) {
    console.error('Failed to complete transfers:', error);
  }
}

transferNFTs().catch(console.error);