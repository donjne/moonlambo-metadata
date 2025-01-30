import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, keypairIdentity, none } from '@metaplex-foundation/umi';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const createMetadata = async () => {
  try {
    // Initialize Umi
    const umi = createUmi('https://api.devnet.solana.com');

    // Load wallet
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairFile = JSON.parse(await readFile(keypairPath, 'utf-8'));
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));

    // Set the wallet as the transaction signer
    umi.use(keypairIdentity(keypair));

    // Your token mint address
    const mint = publicKey('4F9WCp4Dzv9SMf9auVQBbmXH97sVWT28mTzvqiSwgvUR');

    console.log('Starting metadata creation...');
    console.log('Mint:', mint);
    
    const builder = createMetadataAccountV3(umi, {
      mint,
      mintAuthority: keypair.publicKey,
      updateAuthority: keypair.publicKey,
      data: {
        name: "MoonLambo",
        symbol: "MOONL",
        uri: "https://gateway.pinata.cloud/ipfs/QmTZXWYHMgo7jdY4mvAVUSKF6rbUjFeFZQcHoePb1Bu1N8",
        sellerFeeBasisPoints: 0,
        creators: none(),
        collection: none(),
        uses: none(),
      },
      isMutable: true,
      collectionDetails: none(),
    });

    const tx = await builder.sendAndConfirm(umi);
    console.log('Metadata created successfully!');
    console.log('Transaction:', tx);
    
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      logs: error.logs,
      stack: error.stack
    });
  }
};

// Execute the function
createMetadata().catch((error) => console.error('Error:', error));