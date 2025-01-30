import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  mplTokenMetadata, 
  fetchMetadataFromSeeds,
  verifyCollectionV1,
  findMetadataPda 
} from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const COLLECTION_ADDRESS = '9mKksxtbVMcRdpfe9ZJBuuQqShywNfvdyYSkpXSxLms9';
const NFT_ADDRESS = 'J7e5vQdcVbk5m65gYTUYvT3ewZBzsG8kgLd9ZbRK3GTh';
// const UPDATE_AUTHORITY = 'AopUFgSHXJmcQARjTJex43NYcaQSMcVWmKtcYybo43Xm';

const verifyCollection = async () => {
  try {
    // Initialize Umi
    const umi = createUmi('https://api.devnet.solana.com')
      .use(web3JsEddsa())
      .use(mplTokenMetadata());

    // Load wallet
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairFile = JSON.parse(await readFile(keypairPath, 'utf-8'));
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));
    umi.use(keypairIdentity(keypair));

    // Fetch metadata account first
    console.log('Fetching metadata...');
    const metadata = await findMetadataPda(umi, {
      mint: publicKey(NFT_ADDRESS)
    });
    console.log('Metadata:', metadata);

    // Verify the collection
    console.log('Verifying collection...');
    await verifyCollectionV1(umi, {
      metadata: metadata,
      collectionMint: publicKey(COLLECTION_ADDRESS),
      authority: umi.identity,
    }).sendAndConfirm(umi);

    console.log('Collection verified successfully!');

  } catch (error) {
    console.error('Error verifying collection:', error);
    if (error.logs) {
      console.error('Detailed logs:', error.logs);
    }
  }
};

verifyCollection().catch(console.error);