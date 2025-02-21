import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants, Account } from "@aptos-labs/ts-sdk"
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit"

/**
 * Generate a new Aptos account or retrieve existing one
 * @returns The generated account
 */
async function generateAptosAccount(network: Network = Network.MAINNET): Promise<{ account: Account; privateKey: string }> {
    const config = new AptosConfig({ network });
    const aptos = new Aptos(config);

    // Generate new account
    const account = Account.generate();

    // For devnet, we can fund the account
    if (network === Network.DEVNET) {
        try {
            // Try funding up to 3 times
            for (let i = 0; i < 3; i++) {
                try {
                    await aptos.fundAccount({
                        accountAddress: account.accountAddress,
                        amount: 100_000_000
                    });
                    break; // If successful, exit the retry loop
                } catch (e) {
                    if (i === 2) throw e; // Throw on last attempt
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
                }
            }
        } catch (error) {
            console.warn("Failed to fund devnet account:", error);
            // Continue anyway - the account is still valid even if funding failed
        }
    }

    return {
        account,
        privateKey: account.privateKey.toString()
    };
}

/**
 * Initialize the agent with Vercel AI SDK tools
 *
 * @returns Object containing initialized tools and agent runtime
 * @throws Error if initialization fails
 */
export async function initializeAgent({
    network: networkStr,
    privateKey
}: {
    network: string;
    privateKey?: `0x${string}`;
}) {
    try {
        const network = Network.MAINNET;
        const aptosConfig = new AptosConfig({ network });
        const aptos = new Aptos(aptosConfig);

        // If no private key provided, generate new account
        if (!privateKey) {
            const { account, privateKey: newPrivateKey } = await generateAptosAccount(network);
            privateKey = newPrivateKey as `0x${string}`;
        }

        // Remove '0x' prefix if present
        const cleanPrivateKey = privateKey.startsWith('0x')
            ? privateKey.slice(2)
            : privateKey;

        try {
            const account = await aptos.deriveAccountFromPrivateKey({
                privateKey: new Ed25519PrivateKey(cleanPrivateKey),
            });

            const signer = new LocalSigner(account, aptosConfig.network);
            const agent = new AgentRuntime(signer, aptos, {
                PANORA_API_KEY: process.env.PANORA_API_KEY,

            });

            return { agent, privateKey };
        } catch (error) {
            console.error("Failed to derive account, generating new one:", error);
            // Fallback to generating new account if derivation fails
            const { account, privateKey: newPrivateKey } = await generateAptosAccount(network);
            privateKey = newPrivateKey as `0x${string}`;

            const signer = new LocalSigner(account, aptosConfig.network);
            const agent = new AgentRuntime(signer, aptos, {
                PANORA_API_KEY: process.env.PANORA_API_KEY,
            });

            return { agent, privateKey };
        }
    } catch (error) {
        console.error("Failed to initialize agent:", error);
        throw error;
    }
}