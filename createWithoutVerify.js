import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, keypairIdentity, none, generateSigner } from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const COLLECTION_ADDRESS = '3PE2v9UG1GhWBdAu2wdJU2FFdQKPdjXkxLj46GR2gb87';
const NUMBER_OF_NFTS = 10;
const METADATA_URI = "https://gateway.pinata.cloud/ipfs/QmNSEeQmTXAJQYTKnpFiL9uDtK6svtvjVbzrqSwdy4N4m3";

const createNFTs = async () => {
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

    const mintAddresses = [];

    // Create NFTs
    for (let i = 0; i < NUMBER_OF_NFTS; i++) {
      console.log(`Creating NFT #${i + 1}...`);
      const mint = generateSigner(umi);

      await createNft(umi, {
        mint,
        name: "Astro",
        symbol: "AST",
        uri: METADATA_URI,
        sellerFeeBasisPoints: 1000,
        isCollection: false,
        collection: {
          key: publicKey(COLLECTION_ADDRESS),
          verified: false
        },
        creators: [{
          address: keypair.publicKey,
          share: 100,
          verified: true,
        }],
      }).sendAndConfirm(umi);

      mintAddresses.push(mint.publicKey);
      console.log(`NFT #${i + 1} created with mint address:`, mint.publicKey);
    }

    // Save mint addresses to file
    await writeFile(
      'nft_mints.json', 
      JSON.stringify(mintAddresses, null, 2)
    );
    console.log('All NFTs created successfully!');
    console.log('Mint addresses saved to nft_mints.json');

  } catch (error) {
    console.error('Error:', error);
    if (error.logs) {
      console.error('Detailed logs:', error.logs);
    }
  }
};

createNFTs().catch(console.error);