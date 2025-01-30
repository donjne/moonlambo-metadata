import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  mplTokenMetadata,
  updateV1
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  publicKey, 
  keypairIdentity 
} from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const COLLECTION_ADDRESS = '7JFu61K1kgiPw6SmVVGXzEWcb7puf4jefouSihithZsV';
const CURRENT_MINT_AUTHORITY = 'AEqngZHGCqJABzxyEXFCx5n3paPf6Sd5ZXoBTFPw1L3p';

const updateCollectionAuthorities = async () => {
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

    // Update the collection metadata
    console.log('Updating collection authorities...');
    await updateV1(umi, {
      mint: publicKey(COLLECTION_ADDRESS),
      authority: publicKey(CURRENT_MINT_AUTHORITY),
      newUpdateAuthority: keypair.publicKey,
      isMutable: true,
    }).sendAndConfirm(umi);

    console.log('Collection authorities updated successfully!');
    console.log('New authorities:');
    console.log('Update Authority:', keypair.publicKey.toString());

  } catch (error) {
    console.error('Error updating collection:', error);
    if (error.logs) {
      console.error('Detailed logs:', error.logs);
    }
  }
};

updateCollectionAuthorities().catch(console.error);