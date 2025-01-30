import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createNft, mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, keypairIdentity, none, generateSigner } from '@metaplex-foundation/umi';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { readFile } from 'fs/promises';
import { homedir } from 'os';
import { join } from 'path';

const createNFTCollection = async () => {
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

    // Generate a new mint signer
    const mint = generateSigner(umi);

    // Create the collection NFT
    const { response } = await createNft(umi, {
      mint,
      name: "Astro",
      symbol: "AST",
      uri: "https://gateway.pinata.cloud/ipfs/QmNSEeQmTXAJQYTKnpFiL9uDtK6svtvjVbzrqSwdy4N4m3",
      sellerFeeBasisPoints: 1000, // 10% royalties
      isCollection: true,
      collection: none(),
      uses: none(),
      creators: [{
        address: umi.identity,
        share: 100,
        verified: true,
      }],
      authority: umi.identity,
      tokenStandard: 0, // NonFungible
      updateAuthority: umi.identity,
      mintAuthority: umi.identity,
      freezeAuthority: umi.identity,
    }).sendAndConfirm(umi);

    console.log('Collection created successfully!');
    console.log('Collection Mint Address:', mint.publicKey);
    console.log('Authority (your wallet):', umi.identity);

  } catch (error) {
    console.error('Error creating collection:', error);
    console.error('Error details:', error.message);
  }
};

createNFTCollection().catch(console.error);