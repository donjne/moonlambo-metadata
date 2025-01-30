import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchAsset, fetchCollection } from '@metaplex-foundation/mpl-core';

const WORKING_NFT = 'HVnSwRqGN6YRCfPh8iEqNaUGKFN9dkdYsrMquSPxEFpC';
const NON_WORKING_NFT = 'Aeg48DtVY8F1op2FQDaPT7qV2Ue1aEFS7gF3vLy3UXcJ';
const COLLECTION_ADDRESS = '9mKksxtbVMcRdpfe9ZJBuuQqShywNfvdyYSkpXSxLms9';

async function analyzeNFTs() {
    try {
        const umi = createUmi('https://api.devnet.solana.com')
            .use(web3JsEddsa());

        // Fetch and log working NFT details
        console.log('Analyzing Working NFT...');
        const workingNft = await fetchAsset(umi, publicKey(WORKING_NFT));
        console.log('Working NFT Details:');
        console.log('Mint:', WORKING_NFT);
        console.log('Owner:', workingNft.owner.toString());
        console.log('Update Authority:', workingNft.updateAuthority.type); // Log the type
        if (typeof workingNft.updateAuthority === 'object') {
            console.log('Update Authority Details:', JSON.stringify(workingNft.updateAuthority, null, 2));
        }
        console.log('Collection:', workingNft.collection?.address.toString() || 'None');

        console.log('\nAnalyzing Non-Working NFT...');
        const nonWorkingNft = await fetchAsset(umi, publicKey(NON_WORKING_NFT));
        console.log('Non-Working NFT Details:');
        console.log('Mint:', NON_WORKING_NFT);
        console.log('Owner:', nonWorkingNft.owner.toString());
        console.log('Update Authority:', nonWorkingNft.updateAuthority.type); // Log the type
        if (typeof nonWorkingNft.updateAuthority === 'object') {
            console.log('Update Authority Details:', JSON.stringify(nonWorkingNft.updateAuthority, null, 2));
        }
        console.log('Collection:', nonWorkingNft.collection?.address.toString() || 'None');

        console.log('\nAnalyzing Collection...');
        const collection = await fetchCollection(umi, publicKey(COLLECTION_ADDRESS));
        console.log('Collection Details:');
        console.log('Address:', COLLECTION_ADDRESS);
        console.log('Update Authority:', collection.updateAuthority.toString());

    } catch (error) {
        console.error('Error analyzing NFTs:', error);
        if (error.logs) {
            console.error('Error logs:', error.logs);
        }
    }
}

analyzeNFTs();