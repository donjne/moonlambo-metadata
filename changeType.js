import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey, keypairIdentity, some } from '@metaplex-foundation/umi';
import { 
  update, 
  mplCore,
  fetchAsset,
  fetchCollection,
  updateAuthority
} from '@metaplex-foundation/mpl-core';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const NFT_MINT = 'J7e5vQdcVbk5m65gYTUYvT3ewZBzsG8kgLd9ZbRK3GTh';
const ESCROW_ADDRESS = '2BAnwcKZHzohvMjwZ4ekxN2vmrgLF955d8U1cw1XvHVz';
const COLLECTION_ADDRESS = '9mKksxtbVMcRdpfe9ZJBuuQqShywNfvdyYSkpXSxLms9';

async function changeUpdateAuthorityType() {
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

    // Fetch the asset and collection
    const asset = await fetchAsset(umi, publicKey(NFT_MINT));
    const collection = await fetchCollection(umi, publicKey(COLLECTION_ADDRESS));
    
    console.log('Initial asset state:', {
      mint: asset.publicKey.toString(),
      updateAuthority: asset.updateAuthority
    });

    // Step 1: Change from Collection to Address type (using current wallet as initial address)
    console.log('\nStep 1: Changing authority type to Address...');
    const changeTypeTx = await update(umi, {
      asset: asset.publicKey,
      authority: collection.updateAuthority,
      newUpdateAuthority: updateAuthority('Address', umi.identity.publicKey)
    });

    await changeTypeTx.sendAndConfirm(umi);
    console.log('Authority type changed to Address');

    // Verify intermediate state
    const intermediateAsset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('Intermediate asset state:', {
      mint: intermediateAsset.publicKey.toString(),
      updateAuthority: intermediateAsset.updateAuthority
    });

    // Step 2: Transfer to escrow
    console.log('\nStep 2: Transferring authority to escrow...');
    const transferTx = await update(umi, {
      asset: asset.publicKey,
      newUpdateAuthority: updateAuthority('Address', publicKey(ESCROW_ADDRESS))
    });

    await transferTx.sendAndConfirm(umi);
    console.log('Authority transferred to escrow');

    // Verify final state
    const finalAsset = await fetchAsset(umi, publicKey(NFT_MINT));
    console.log('\nFinal asset state:', {
      mint: finalAsset.publicKey.toString(),
      updateAuthority: finalAsset.updateAuthority
    });

  } catch (error) {
    console.error('Failed to change update authority:', error);
    if ('logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
  }
}

changeUpdateAuthorityType().catch(console.error);