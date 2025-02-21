import { AccountAddress } from "@aptos-labs/ts-sdk"
import { AgentRuntime } from "move-agent-kit"
import { Tool } from "ai"
import { z } from "zod"

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

export function getVercelAITools(agent: AgentRuntime) {
    return {
        getBalance: {
            name: 'getBalance',
            description: 'Get the balance of the current account',
            parameters: z.object({}),
            execute: async () => logToolExecution('getBalance', {}, () => agent.getBalance())
        } as Tool,
        getAddress: {
            name: 'getAddress',
            description: 'Get the address of the current account',
            parameters: z.object({}),
            execute: async () => logToolExecution('getAddress', {}, async () => agent.account.getAddress().toString())
        } as Tool,
        transferTokens: {
            name: 'transferTokens',
            description: 'Transfer tokens to another account',
            parameters: z.object({
                to: z.string(),
                amount: z.number(),
                mint: z.string()
            }),
            execute: async ({ to, amount, mint }) =>
                logToolExecution('transferTokens', { to, amount, mint },
                    () => agent.transferTokens(AccountAddress.fromString(to), amount, mint))
        } as Tool,
        createToken: {
            name: 'createToken',
            description: 'Create a new token',
            parameters: z.object({
                name: z.string(),
                symbol: z.string(),
                iconURI: z.string(),
                projectURI: z.string()
            }),
            execute: async ({ name, symbol, iconURI, projectURI }) =>
                logToolExecution('createToken', { name, symbol, iconURI, projectURI },
                    () => agent.createToken(name, symbol, iconURI, projectURI))
        } as Tool,
        mintToken: {
            name: 'mintToken',
            description: 'Mint tokens to an account',
            parameters: z.object({
                to: z.string(),
                mint: z.string(),
                amount: z.number()
            }),
            execute: async ({ to, mint, amount }) =>
                logToolExecution('mintToken', { to, mint, amount },
                    () => agent.mintToken(AccountAddress.fromString(to), mint, amount))
        } as Tool,
        burnToken: {
            name: 'burnToken',
            description: 'Burn tokens',
            parameters: z.object({
                amount: z.number(),
                mint: z.string()
            }),
            execute: async ({ amount, mint }) =>
                logToolExecution('burnToken', { amount, mint },
                    () => agent.burnToken(amount, mint))
        } as Tool,
        getTokenDetails: {
            name: 'getTokenDetails',
            description: 'Get details about a token',
            parameters: z.object({
                mint: z.string()
            }),
            execute: async ({ mint }) =>
                logToolExecution('getTokenDetails', { mint },
                    () => agent.getTokenDetails(mint))
        } as Tool,
        getTransaction: {
            name: 'getTransaction',
            description: 'Get transaction details',
            parameters: z.object({
                hash: z.string()
            }),
            execute: async ({ hash }) =>
                logToolExecution('getTransaction', { hash },
                    () => agent.getTransaction(hash))
        } as Tool,
    }
} 