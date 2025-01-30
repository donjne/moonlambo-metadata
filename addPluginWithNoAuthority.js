import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi';
import { 
  addPlugin,
  mplCore,
  fetchAsset,
  fetchCollection 
} from '@metaplex-foundation/mpl-core';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const NFT_MINT = 'J7e5vQdcVbk5m65gYTUYvT3ewZBzsG8kgLd9ZbRK3GTh';
const COLLECTION_ADDRESS = '9mKksxtbVMcRdpfe9ZJBuuQqShywNfvdyYSkpXSxLms9';

async function addAttributesPlugin() {
  try {
    // Initialize Umi
    const umi = createUmi('https://api.devnet.solana.com')
      .use(web3JsEddsa())
      .use(mplCore());

    // Load local keypair
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairFile = JSON.parse(await readFile(keypairPath, 'utf-8'));
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));
    umi.use(keypairIdentity(keypair));

    // Fetch the asset first
    const asset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('Asset fetched:', asset.publicKey.toString());

    // Fetch the collection
    const collection = await fetchCollection(umi, publicKey(COLLECTION_ADDRESS));
    console.log('Collection fetched:', collection.publicKey.toString());

    console.log('Adding Attributes plugin...');
    const tx = await addPlugin(umi, {
      asset: asset.publicKey,
      collection: collection,
      plugin: {
        type: 'Attributes',
        attributeList: [{ key: 'initial', value: 'value' }],
      },
    });

    const result = await tx.sendAndConfirm(umi);
    console.log('Attributes plugin added successfully!');
    console.log('Signature:', result.signature);

    // Verify the changes
    const updatedAsset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('Updated asset:', updatedAsset);

  } catch (error) {
    console.error('Failed to add Attributes plugin:', error);
    if ('logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
  }
}

addAttributesPlugin().catch(console.error);