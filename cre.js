import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { create, fetchCollection, fetchAssetsByCollection } from '@metaplex-foundation/mpl-core';
import { keypairIdentity, generateSigner, publicKey } from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile, writeFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const COLLECTION_ADDRESS = 'NknXopdMRmM8nFYMW3BFZQzyarJBoGAdMdZANkLHsrx';
const ESCROW_ADDRESS = '2BAnwcKZHzohvMjwZ4ekxN2vmrgLF955d8U1cw1XvHVz';
const MINT_ADDRESS = '6Ajc185h256k1fVxuWGJCZjUXbFT8SQ17J3LZLRCLbTr';
const NUMBER_OF_NFTS = 5;
const METADATA_URI = "https://gateway.pinata.cloud/ipfs/QmbAq5DNm12giJyh5hHY4R2ky9s35gCtiopZzz6URYt2Gx";

const createCoreNFTs = async () => {
  try {
    // Initialize Umi
    const umi = createUmi('https://api.devnet.solana.com')
      .use(web3JsEddsa());

    // Load wallet
    const keypairPath = join(homedir(), '.config', 'solana', 'id.json');
    const keypairFile = JSON.parse(await readFile(keypairPath, 'utf-8'));
    const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(keypairFile));
    umi.use(keypairIdentity(keypair));

    // Fetch the collection
    const collection = await fetchCollection(umi, publicKey(COLLECTION_ADDRESS));
    
    const assetAddresses = [];

    // Create multiple NFTs
    for (let i = 0; i < NUMBER_OF_NFTS; i++) {
      console.log(`Creating NFT #${i + 1}...`);

      // Generate a new asset signer for each NFT
      const assetSigner = generateSigner(umi);

      // Create the NFT
      const { signature } = await create(umi, {
        asset: assetSigner,
        name: `Astro SZN #${i + 1}`,
        uri: "https://gateway.pinata.cloud/ipfs/QmNSEeQmTXAJQYTKnpFiL9uDtK6svtvjVbzrqSwdy4N4m3",
        symbol: "AST",
        collection: collection,
        owner: publicKey(MINT_ADDRESS),
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

      assetAddresses.push(assetSigner.publicKey);
      console.log(`NFT #${i + 1} created with address:`, assetSigner.publicKey);
      console.log('Owner:', MINT_ADDRESS);
      console.log('Update Authority:', MINT_ADDRESS);
      console.log('Signature:', signature);
    }

    // Save asset addresses
    await writeFile(
      'nft_assets_two.json', 
      JSON.stringify(assetAddresses, null, 2)
    );
    console.log('Asset addresses saved to nft_assets.json');

    console.log('Summary:');
    console.log(`Created ${NUMBER_OF_NFTS} NFTs`);
    console.log('Collection Address:', COLLECTION_ADDRESS);

  } catch (error) {
    console.error('Error creating NFTs:', error);
    console.error('Error details:', error.message);
  }
};

createCoreNFTs().catch(console.error);