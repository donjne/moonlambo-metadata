import { NFTStorage, File } from 'nft.storage';
import { readFileSync } from 'fs';

// Your NFT.Storage API key (you'll get this after signing up)
const NFT_STORAGE_KEY = 'e80283cb.f5450fd1736a41d8a315b866b02c9546';

async function uploadMetadata() {
    const client = new NFTStorage({ token: NFT_STORAGE_KEY });

    try {
        // Fetch the image
        const imageResponse = await fetch('https://pbs.twimg.com/media/GeAA9hPWgAAwCvt?format=png&name=900x900');
        const imageData = await imageResponse.arrayBuffer();
        const imageFile = new File([imageData], 'moonlambo.png', { type: 'image/png' });

        // Upload the image
        console.log('Uploading image...');
        const imageCid = await client.storeBlob(imageFile);
        const imageUrl = `https://ipfs.io/ipfs/${imageCid}`;
        console.log('Image uploaded:', imageUrl);

        // Create metadata
        const metadata = {
            name: "MoonLambo",
            symbol: "MOONL",
            description: "This coin symbolizes the ultimate goal of every trader: rocketing to the moon and arriving in style. Everyone in crypto is chasing their moonshot—and with MOONL, the ride is half the fun!",
            image: imageUrl,
            attributes: [],
            properties: {
                files: [
                    {
                        uri: imageUrl,
                        type: "image/png"
                    }
                ]
            }
        };

        // Upload the metadata
        console.log('Uploading metadata...');
        const metadataFile = new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' });
        const metadataCid = await client.storeBlob(metadataFile);
        const metadataUri = `https://ipfs.io/ipfs/${metadataCid}`;
        
        console.log('Upload complete!');
        console.log('Metadata URI:', metadataUri);
        
        return metadataUri;
    } catch (error) {
        console.error('Error uploading:', error);
        throw error;
    }
}


uploadMetadata();
