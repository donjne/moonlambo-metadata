import axios from 'axios';

const PINATA_API_KEY = '9eb3ea21bd924304850f';
const PINATA_SECRET_KEY = '9dc69487886789a240df51afba6301850f0ad564dd02909e0ad9a3da3449affc';

async function uploadMetadataSequenceToPinata(startIndex, count) {
    try {
        const files = [];
        
        // Generate all the metadata files
        for (let i = startIndex; i < startIndex + count; i++) {
            const metadata = {
                name: `Astro #${i}`,
                symbol: "AST",
                description: "Whether you're a hodler, trader, or meme enthusiast, owning an Astro means being part of an elite community of visionaries aiming for the stars.",
                image: "https://gateway.pinata.cloud/ipfs/bafybeig6m4bqa6dqtp3ylpsi2edqlgtlperf7orcw7auaxusuy555pgxpm",
                external_url: "",
                seller_fee_basis_points: 0,
                properties: {
                    files: [
                        {
                            uri: "https://gateway.pinata.cloud/ipfs/bafybeig6m4bqa6dqtp3ylpsi2edqlgtlperf7orcw7auaxusuy555pgxpm",
                            type: "image/png"
                        }
                    ],
                    category: "image",
                    creators: [
                        {
                            address: "AopUFgSHXJmcQARjTJex43NYcaQSMcVWmKtcYybo43Xm",
                            share: 25
                        },
                        {
                            address: "5jD4WTmGYmJG6e9JjRvJX8Svk5Ph2rxqwPjrqky33rRg",
                            share: 25
                        },
                        {
                            address: "6Ajc185h256k1fVxuWGJCZjUXbFT8SQ17J3LZLRCLbTr",
                            share: 25
                        },
                        {
                            address: "2BAnwcKZHzohvMjwZ4ekxN2vmrgLF955d8U1cw1XvHVz",
                            share: 25
                        }
                    ]
                }
            };
            
            files.push({
                [i + ".json"]: metadata
            });
        }

        // Upload to Pinata
        console.log('Uploading metadata sequence...');
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinJSONToIPFS',
            {
                pinataContent: files,
                pinataMetadata: {
                    name: "astro-metadata",
                    keyvalues: {
                        count: count.toString(),
                        startIndex: startIndex.toString()
                    }
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'pinata_api_key': PINATA_API_KEY,
                    'pinata_secret_api_key': PINATA_SECRET_KEY
                }
            }
        );

        const baseUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log('Upload complete!');
        console.log('Base URL:', baseUrl);
        console.log('Example URLs:');
        console.log(`${baseUrl}/0.json`);
        console.log(`${baseUrl}/1.json`);
        console.log(`${baseUrl}/2.json`);
        
        return baseUrl;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Upload 10 metadata files starting from index 0
uploadMetadataSequenceToPinata(0, 10);