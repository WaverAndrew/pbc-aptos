import { Aptos, AptosConfig, Ed25519PrivateKey, Network, PrivateKey, PrivateKeyVariants } from "@aptos-labs/ts-sdk"
import { AgentRuntime, LocalSigner, createAptosTools } from "move-agent-kit"
import { DEFAULT_NETWORK, SUPPORTED_NETWORKS } from "../../networks"

// Initialize Aptos configuration
const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
})

const aptos = new Aptos(aptosConfig)

// Validate and get private key from environment
const privateKeyStr = process.env.APTOS_PRIVATE_KEY
if (!privateKeyStr) {
    throw new Error("Missing APTOS_PRIVATE_KEY environment variable")
}

// Setup account and signer
const account = await aptos.deriveAccountFromPrivateKey({
    privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKeyStr, PrivateKeyVariants.Ed25519)),
})

const signer = new LocalSigner(account, Network.MAINNET)
const aptosAgent = new AgentRuntime(signer, aptos, {
    PANORA_API_KEY: process.env.PANORA_API_KEY,
})

const tools = createAptosTools(aptosAgent)

/**
 * Initialize the agent with Vercel AI SDK tools
 *
 * @returns Object containing initialized tools
 * @throws Error if initialization fails
 */
export async function initializeAgent({
    network,
    privateKey
}: {
    network: string;
    privateKey: `0x${string}`;
}) {
    try {
        const aptosConfig = new AptosConfig({
            network: SUPPORTED_NETWORKS.find((n: { name: string }) => n.name === network)?.network || DEFAULT_NETWORK.network,
        })

        const aptos = new Aptos(aptosConfig)

        const account = await aptos.deriveAccountFromPrivateKey({
            privateKey: new Ed25519PrivateKey(PrivateKey.formatPrivateKey(privateKey, PrivateKeyVariants.Ed25519)),
        })

        const signer = new LocalSigner(account, aptosConfig.network)
        const aptosAgent = new AgentRuntime(signer, aptos, {
            PANORA_API_KEY: process.env.PANORA_API_KEY,
        })

        const tools = createAptosTools(aptosAgent)
        return { tools }
    } catch (error) {
        console.error("Failed to initialize agent:", error)
        throw error
    }
}