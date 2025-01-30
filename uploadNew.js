import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import path from 'path';

const PINATA_API_KEY = '9eb3ea21bd924304850f';
const PINATA_SECRET_KEY = '9dc69487886789a240df51afba6301850f0ad564dd02909e0ad9a3da3449affc';

async function uploadMetadataSequenceToPinata(startIndex, count) {
    const tempDir = './temp_metadata';
    try {
        // Create temp directory if it doesn't exist
        await fs.mkdir(tempDir, { recursive: true });

        // Create array to hold promises of file writes
        const writePromises = [];

        // Generate all metadata files
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

            const filePath = path.join(tempDir, `${i}.json`);
            writePromises.push(fs.writeFile(filePath, JSON.stringify(metadata, null, 2)));
        }

        // Wait for all files to be written
        await Promise.all(writePromises);

        // Create FormData instance
        const formData = new FormData();

        // Read all files from the directory
        const files = await fs.readdir(tempDir);
        
        // Add each file to formData
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const content = await fs.readFile(filePath);
            formData.append('file', content, { filename: file });
        }

        // Add metadata
        formData.append('pinataMetadata', JSON.stringify({
            name: "astro-metadata",
            keyvalues: {
                count: count.toString(),
                startIndex: startIndex.toString()
            }
        }));

        // Upload to Pinata
        console.log('Uploading metadata sequence...');
        const response = await axios.post(
            'https://api.pinata.cloud/pinning/pinFileToIPFS',
            formData,
            {
                maxContentLength: Infinity,
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_KEY
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

        // Clean up - remove temp directory and files
        await fs.rm(tempDir, { recursive: true, force: true });
        
        return baseUrl;
    } catch (error) {
        // Clean up on error too
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (cleanupError) {
            console.error('Error during cleanup:', cleanupError);
        }
        
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// Upload 10 metadata files starting from index 0
uploadMetadataSequenceToPinata(0, 10);