import { PrivateKey } from "@aptos-labs/ts-sdk";

function getPublicFromPrivate(privateKeyStr: string) {
    // Create private key instance from the input string
    const privateKeyObject = new PrivateKey(privateKeyStr);
    
    // Get the public key
    const publicKey = privateKeyObject.publicKey();
    
    // Get the account address
    const accountAddress = publicKey.toAddress();

    console.log('\nAptos Account Details:');
    console.log('================================');
    console.log('Account Address:', accountAddress.toString());
    console.log('Public Key:', publicKey.toString());
    console.log('================================\n');
}

// Example usage - replace with your private key
const privateKey = "0x..."; // Your private key here
getPublicFromPrivate(privateKey); 