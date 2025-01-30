import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { 
  createNft, 
  mplTokenMetadata, 
  verifyCollectionV1 
} from '@metaplex-foundation/mpl-token-metadata';
import { 
  publicKey, 
  keypairIdentity, 
  none, 
  generateSigner 
} from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const COLLECTION_ADDRESS = '7JFu61K1kgiPw6SmVVGXzEWcb7puf4jefouSihithZsV';
const NUMBER_OF_NFTS = 10;
// Using the same metadata URI as collection
const METADATA_URI = "https://gateway.pinata.cloud/ipfs/QmbAq5DNm12giJyh5hHY4R2ky9s35gCtiopZzz6URYt2Gx";

const createCollectionNFTs = async () => {
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

    // Create multiple NFTs
    for (let i = 0; i < NUMBER_OF_NFTS; i++) {
      console.log(`Creating NFT #${i + 1}...`);

      // Generate a new mint signer for each NFT
      const mint = generateSigner(umi);

      // Create the NFT with collection's metadata
      const { response } = await createNft(umi, {
        mint,
        name: "Astro",
        symbol: "AST",
        uri: METADATA_URI,
        sellerFeeBasisPoints: 500,
        isCollection: false,
        collection: {
          key: publicKey(COLLECTION_ADDRESS),
          verified: false
        },
        uses: none(),
        creators: [{
          address: keypair.publicKey,
          share: 100,
          verified: true,
        }],
      }).sendAndConfirm(umi);

      // Verify the collection
      console.log(`Verifying collection for NFT #${i + 1}...`);
      await verifyCollectionV1(umi, {
        mint: mint.publicKey,
        collectionMint: publicKey(COLLECTION_ADDRESS),
        collectionAuthority: keypair.publicKey,
      }).sendAndConfirm(umi);

      mintAddresses.push(mint.publicKey);
      console.log(`NFT #${i + 1} created and verified with mint address:`, mint.publicKey);
    }

    // Save mint addresses
    await writeFile(
      'nft_mints.json', 
      JSON.stringify(mintAddresses, null, 2)
    );
    console.log('Mint addresses saved to nft_mints.json');

    console.log('Summary:');
    console.log(`Created ${NUMBER_OF_NFTS} NFTs`);
    console.log('All NFTs use collection metadata:', METADATA_URI);

  } catch (error) {
    console.error('Error creating NFTs:', error);
    console.error('Error details:', error.message);
  }
};

createCollectionNFTs().catch(console.error);