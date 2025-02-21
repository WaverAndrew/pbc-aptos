import { Tool } from "ai"
import { z } from "zod"
import { AgentRuntime } from "move-agent-kit"
import { AccountAddress, MoveStructId, convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { getTokenByTokenAddress, getTokenByTokenName } from "./token-utils"

const logToolExecution = async <T>(toolName: string, params: any, execute: () => Promise<T>): Promise<T> => {
    console.log(`[Tool Execution Start] ${toolName}`, { params });
    try {
        const result = await execute();
        console.log(`[Tool Execution Success] ${toolName}`, { result });
        return result;
    } catch (error) {
        console.error(`[Tool Execution Error] ${toolName}`, { error });
        throw error;
    }
};

export function getMoveAgentTools(agent: AgentRuntime) {
    return {
        getTransaction: {
            name: 'getTransaction',
            description: 'Get details about a transaction by its hash',
            parameters: z.object({
                hash: z.string().describe('The transaction hash to look up')
            }),
            execute: async ({ hash }) =>
                logToolExecution('getTransaction', { hash },
                    () => agent.aptos.getTransactionByHash({ transactionHash: hash }))
        } as Tool,

        getTokenPrice: {
            name: 'getTokenPrice',
            description: 'Get the live price of any aptos tokens in USD',
            parameters: z.object({
                token: z.string().describe('Token symbol, eg usdt, btc etc.')
            }),
            execute: async ({ token }) =>
                logToolExecution('getTokenPrice', { token },
                    () => agent.getTokenPrice(token))
        } as Tool,

        getTokenDetails: {
            name: 'getTokenDetails',
            description: 'Get the detail of any aptos tokens. Details include decimals which can be used to make onchain values readable to a human user',
            parameters: z.object({
                token: z.string().optional().describe('Token address, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT"')
            }),
            execute: async ({ token }) =>
                logToolExecution('getTokenDetails', { token },
                    () => agent.getTokenDetails(token || ''))
        } as Tool,

        getPoolDetails: {
            name: 'getPoolDetails',
            description: 'Get token/fungible asset pool details',
            parameters: z.object({
                mint: z.string().describe('Token mint address, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT"')
            }),
            execute: async ({ mint }) =>
                logToolExecution('getPoolDetails', { mint },
                    () => agent.getPoolDetails(mint))
        } as Tool,

        getUserPosition: {
            name: 'getUserPosition',
            description: 'Get details about a user\'s position',
            parameters: z.object({
                userAddress: z.string().optional().describe('User address (optional - defaults to current user)'),
                positionId: z.string().describe('Position ID to query')
            }),
            execute: async ({ userAddress, positionId }) =>
                logToolExecution('getUserPosition', { userAddress, positionId },
                    () => agent.getUserPosition(
                        userAddress ? AccountAddress.from(userAddress) : agent.account.getAddress(),
                        positionId
                    ))
        } as Tool,

        swapWithPanora: {
            name: 'swapWithPanora',
            description: 'Swap tokens using Panora exchange',
            parameters: z.object({
                fromToken: z.string().describe('Address of the token to swap from'),
                toToken: z.string().describe('Address of the token to swap to'),
                swapAmount: z.number().describe('Amount of tokens to swap'),
                toWalletAddress: z.string().optional().describe('Destination wallet address (optional - defaults to current user)')
            }),
            execute: async ({ fromToken, toToken, swapAmount, toWalletAddress }) =>
                logToolExecution('swapWithPanora', { fromToken, toToken, swapAmount, toWalletAddress },
                    () => agent.swapWithPanora(fromToken, toToken, swapAmount, toWalletAddress))
        } as Tool,

        // Add all other Move Agent Kit tools following the same pattern
        // For example:
        getAccountResources: {
            name: 'getAccountResources',
            description: 'Get all resources for an account',
            parameters: z.object({
                address: z.string().describe('The account address to query')
            }),
            execute: async ({ address }) =>
                logToolExecution('getAccountResources', { address },
                    () => agent.aptos.getAccountResources({ accountAddress: address }))
        } as Tool,

        getBalance: {
            name: 'getBalance',
            description: 'Get the balance of an Aptos account. If no mint is provided, returns APT balance.',
            parameters: z.object({
                mint: z.string().optional().describe('Token address, eg "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT"')
            }),
            execute: async ({ mint }) =>
                logToolExecution('getBalance', { mint },
                    () => agent.getBalance(mint))
        } as Tool,

        burnNFT: {
            name: 'burnNFT',
            description: 'Burn any NFT on Aptos',
            parameters: z.object({
                mint: z.string().describe('NFT address to burn')
            }),
            execute: async ({ mint }) =>
                logToolExecution('burnNFT', { mint },
                    () => agent.burnNFT(mint))
        } as Tool,

        burnToken: {
            name: 'burnToken',
            description: 'Burn fungible asset token',
            parameters: z.object({
                amount: z.number().describe('Amount to burn'),
                mint: z.string().describe('Fungible asset address to burn')
            }),
            execute: async ({ amount, mint }) =>
                logToolExecution('burnToken', { amount, mint },
                    () => agent.burnToken(amount, mint))
        } as Tool,

        createToken: {
            name: 'createToken',
            description: 'Create a new fungible asset token',
            parameters: z.object({
                name: z.string().describe('Name of the token'),
                symbol: z.string().describe('Symbol of the token'),
                iconURI: z.string().describe('URI of the token icon'),
                projectURI: z.string().describe('URI of the token project')
            }),
            execute: async ({ name, symbol, iconURI, projectURI }) =>
                logToolExecution('createToken', { name, symbol, iconURI, projectURI },
                    () => agent.createToken(name, symbol, iconURI, projectURI))
        } as Tool,

        createAriesProfile: {
            name: 'createAriesProfile',
            description: 'Create a new profile in Aries',
            parameters: z.object({}),
            execute: async () =>
                logToolExecution('createAriesProfile', {},
                    () => agent.createAriesProfile())
        } as Tool,

        lendAriesToken: {
            name: 'lendAriesToken',
            description: 'Lend tokens in Aries. For APT, use "0x1::aptos_coin::AptosCoin" as mintType',
            parameters: z.object({
                mintType: z.string().describe('Token mint type, eg "0x1::aptos_coin::AptosCoin"'),
                amount: z.number().describe('Amount to lend')
            }),
            execute: async ({ mintType, amount }) =>
                logToolExecution('lendAriesToken', { mintType, amount },
                    async () => {
                        const mintDetail = await agent.getTokenDetails(mintType);
                        return agent.lendAriesToken(
                            mintType,
                            convertAmountFromHumanReadableToOnChain(amount, mintDetail.decimals || 8)
                        );
                    })
        } as Tool,

        withdrawEchelonToken: {
            name: 'withdrawEchelonToken',
            description: 'Withdraw tokens from Echelon. Supports APT and various tokens like USDT, ZUSDT, ZUSDC, etc.',
            parameters: z.object({
                amount: z.number().describe('Amount to withdraw'),
                mint: z.string().describe('Token mint address or name (e.g. "0x1::aptos_coin::AptosCoin" or "usdt")')
            }),
            execute: async ({ amount, mint }) =>
                logToolExecution('withdrawEchelonToken', { amount, mint },
                    async () => {
                        const token = getTokenByTokenName(mint) || getTokenByTokenAddress(mint);
                        if (!token) throw new Error("Token not found");

                        const mintDetail = await agent.getTokenDetails(token.tokenAddress);
                        return agent.withdrawTokenWithEchelon(
                            token.tokenAddress as MoveStructId,
                            convertAmountFromHumanReadableToOnChain(amount, mintDetail.decimals || 8),
                            token.poolAddress,
                            token.tokenAddress.split("::").length !== 3
                        );
                    })
        } as Tool,

        // Add more tools following the same pattern...
    }
} 