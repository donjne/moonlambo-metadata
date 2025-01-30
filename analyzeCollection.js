import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { web3JsEddsa } from '@metaplex-foundation/umi-eddsa-web3js';
import { publicKey } from '@metaplex-foundation/umi';
import { fetchCollection, fetchCollectionsByUpdateAuthority } from '@metaplex-foundation/mpl-core';
import { mplTokenAuthRules } from '@metaplex-foundation/mpl-token-auth-rules';

const COLLECTION_ADDRESS = '3W49jasuVCzLxoAkQ2Wt8TNb5CdqRCMDjKXnDYh8hRSc';
const COLLECTION_AUTHORITY = 'AopUFgSHXJmcQARjTJex43NYcaQSMcVWmKtcYybo43Xm';
const ESCROW_ADDRESS = '2BAnwcKZHzohvMjwZ4ekxN2vmrgLF955d8U1cw1XvHVz';

async function analyzeCollectionSetup() {
    try {
        const umi = createUmi('https://api.devnet.solana.com')
            .use(web3JsEddsa())
            .use(mplTokenAuthRules());

        // Fetch collection details
        console.log('Fetching collection details...');
        const collection = await fetchCollection(umi, publicKey(COLLECTION_ADDRESS));
        
        console.log('Collection Basic Details:');
        console.log('Address:', COLLECTION_ADDRESS);
        console.log('Update Authority:', collection.updateAuthority.toString());
        console.log('Name:', collection.name);
        console.log('Symbol:', collection.symbol);
        
        // Check collection authorities
        console.log('\nAnalyzing Collection Authorities...');
        
        // Check escrow's relationship to collection
        console.log('\nAnalyzing Escrow Relationship:');
        console.log('Escrow Address:', ESCROW_ADDRESS);
        
        // Additional collection metadata
        console.log('\nCollection Metadata:');
        console.log('URI:', collection.uri);
        if (collection.plugins) {
            console.log('Plugins:', JSON.stringify(collection.plugins, null, 2));
        }
        
        // Check delegates if any
        try {
            const delegates = await fetchCollectionsByUpdateAuthority(umi, publicKey(COLLECTION_ADDRESS));
            console.log('\nCollection Delegates:', JSON.stringify(delegates, null, 2));
        } catch (error) {
            console.log('\nNo delegates found or error fetching delegates');
        }

        // Try to fetch any additional permissions or settings
        console.log('\nAdditional Collection Settings:');
        console.log('Is Mutable:', !collection.plugins?.find(p => p.type === 'Immutable'));
        
    } catch (error) {
        console.error('Error analyzing collection:', error);
        if (error.logs) {
            console.error('Error logs:', error.logs);
        }
    }
}

analyzeCollectionSetup();