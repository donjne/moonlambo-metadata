import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey, keypairIdentity } from '@metaplex-foundation/umi';
import { 
  mplCore,
  fetchAsset,
  fetchCollection,
  approve,
  de
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

    // Fetch the asset
    const asset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('Current asset state:', {
      mint: asset.publicKey.toString(),
      updateAuthority: asset.updateAuthority
    });

    // Fetch the collection
    const collection = await fetchCollection(umi, publicKey(COLLECTION_ADDRESS));
    console.log('Collection fetched:', collection.publicKey.toString());
    console.log('Update Authority fetched:', collection.updateAuthority.toString());
    
    console.log('Delegating authority...');
    const tx = await approve(umi, {
      asset: publicKey(NFT_MINT),
      authority: publicKey(collection.updateAuthority),
      delegate: publicKey(ESCROW_ADDRESS),
      delegateArgs: {
        __kind: 'UpdateV1',
        fields: [],
      }
    });

    const result = await tx.sendAndConfirm(umi);
    console.log('Authority delegated successfully!');
    console.log('Signature:', result.signature);

    // Verify the asset state after delegation
    const updatedAsset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('New asset state:', {
      mint: updatedAsset.publicKey.toString(),
      updateAuthority: updatedAsset.updateAuthority,
      delegates: updatedAsset.delegates
    });

  } catch (error) {
    console.error('Failed to delegate authority:', error);
    if ('logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
  }
}

delegateAuthority().catch(console.error);