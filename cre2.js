import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createCollection } from '@metaplex-foundation/mpl-core';
import { keypairIdentity, generateSigner, publicKey } from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const MINT_ADDRESS = '5jD4WTmGYmJG6e9JjRvJX8Svk5Ph2rxqwPjrqky33rRg';

const createCoreCollection = async () => {
  try {
    // Initialize Umi
    const umi = createUmi('https://api.devnet.solana.com')
      .use(web3JsEddsa());

    // Load wallet
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairFile = JSON.parse(await readFile(keypairPath, 'utf-8'));
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));
    umi.use(keypairIdentity(keypair));

    // Generate a new collection signer
    const collectionSigner = generateSigner(umi);

    // Create the collection
    const { signature } = await createCollection(umi, {
      collection: collectionSigner,
      name: "Astro",
      updateAuthority: publicKey(MINT_ADDRESS),
      uri: "https://gateway.pinata.cloud/ipfs/QmNSEeQmTXAJQYTKnpFiL9uDtK6svtvjVbzrqSwdy4N4m3",
      symbol: "AST",
      plugins: [
        {
          type: 'Royalties',
          basisPoints: 500, // 5% royalties
          creators: [
            {
              address: publicKey(MINT_ADDRESS),
              percentage: 100,
            }
          ],
          ruleSet: { type: 'None' },
        }
      ],
    }).sendAndConfirm(umi);

    console.log('Collection created successfully!');
    console.log('Collection Address:', collectionSigner.publicKey);
    console.log('Signature:', signature);

  } catch (error) {
    console.error('Error creating collection:', error);
    console.error('Error details:', error.message);
  }
};

createCoreCollection().catch(console.error);