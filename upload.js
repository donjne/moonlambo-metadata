import axios from 'axios';

// You'll get these from Pinata dashboard
const PINATA_API_KEY = '9eb3ea21bd924304850f';
const PINATA_SECRET_KEY = '9dc69487886789a240df51afba6301850f0ad564dd02909e0ad9a3da3449affc';

async function uploadMetadataToPinata() {
    try {
        const metadata = {
            name: "MoonLambo",
            symbol: "MOONL",
            description: "This coin symbolizes the ultimate goal of every trader: rocketing to the moon and arriving in style. Everyone in crypto is chasing their moonshot—and with MOONL, the ride is half the fun!",
            image: "https://gateway.pinata.cloud/ipfs/bafkreicliehdi57cc35sdbjvaobtzw6sd4karujcto4e5w5ucbsreqbl5i",
            attributes: [],
            properties: {
                files: [
                    {
                        uri: "https://gateway.pinata.cloud/ipfs/bafkreicliehdi57cc35sdbjvaobtzw6sd4karujcto4e5w5ucbsreqbl5i",
                        type: "image/png"
                    }
                ]
            }
        };

        // Upload metadata to Pinata
        console.log('Uploading metadata...');
        const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', metadata, {
            headers: {
                'pinata_api_key': PINATA_API_KEY,
                'pinata_secret_api_key': PINATA_SECRET_KEY
            }
        });

        const metadataUrl = `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
        console.log('Upload complete!');
        console.log('Metadata URL:', metadataUrl);
        
        return metadataUrl;
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        throw error;
    }
}

uploadMetadataToPinata();