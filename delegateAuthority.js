import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi';
import { 
  approvePluginAuthority, 
  mplCore,
  fetchAsset,
  fetchCollection, 
} from '@metaplex-foundation/mpl-core';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const NFT_MINT = 'J7e5vQdcVbk5m65gYTUYvT3ewZBzsG8kgLd9ZbRK3GTh';
const ESCROW_ADDRESS = '2BAnwcKZHzohvMjwZ4ekxN2vmrgLF955d8U1cw1XvHVz';
const COLLECTION_ADDRESS = '9mKksxtbVMcRdpfe9ZJBuuQqShywNfvdyYSkpXSxLms9';

async function delegateAuthority() {
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

    console.log('Delegating update authority...');
    console.log('NFT:', NFT_MINT);
    console.log('Delegating to:', ESCROW_ADDRESS);

    // Delegate the UpdateAuthority plugin
    const tx = await approvePluginAuthority(umi, {
      asset: asset.publicKey,
      collection: collection,
      plugin: { type: 'Attributes' },
      newAuthority: { 
        type: 'Address', 
        address: publicKey(ESCROW_ADDRESS) 
      },
    });

    const result = await tx.sendAndConfirm(umi);
    console.log('Update authority delegated successfully!');
    console.log('Signature:', result.signature);

    // Verify the delegation
    const updatedAsset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('Updated asset:', updatedAsset);

  } catch (error) {
    console.error('Failed to delegate update authority:', error);
    if ('logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
  }
}

delegateAuthority().catch(console.error);