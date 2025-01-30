import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi';
import { 
  addPlugin,
  mplCore,
  fetchAsset,
  fetchCollection,
  approvePluginAuthority  
} from '@metaplex-foundation/mpl-core';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const NFT_MINT = 'FLhJXzv67VceXMEVssKYpFKW7w1XvPVUcCacA8z7uR5E';
const ESCROW_ADDRESS = '6Ajc185h256k1fVxuWGJCZjUXbFT8SQ17J3LZLRCLbTr';
const COLLECTION_ADDRESS = '3W49jasuVCzLxoAkQ2Wt8TNb5CdqRCMDjKXnDYh8hRSc';

async function addTransferDelegate() {
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
    console.log("Authority:", umi.identity.publicKey);

    console.log('Adding Transfer Delegate plugin...');
    const tx = await addPlugin(umi, {
      asset: publicKey(NFT_MINT),
      collection: collection,
      authority: umi.identity.publicKey,
      plugin: {
        type: 'TransferDelegate',
        authority: {
          type: 'Address',
          address: publicKey(ESCROW_ADDRESS)
        }
      }
    });

    const result = await tx.sendAndConfirm(umi);
    console.log('Transfer Delegate plugin added successfully!');
    console.log('Signature:', result.signature);

    // Verify the changes
    const updatedAsset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('Updated asset plugins:', updatedAsset.plugins);

  } catch (error) {
    console.error('Failed to add Transfer Delegate plugin:', error);
    if ('logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
  }
}

addTransferDelegate().catch(console.error);