import { MoveStructId } from "@aptos-labs/ts-sdk";

interface Token {
    tokenAddress: MoveStructId;
    poolAddress: string;
}

const TOKEN_MAP: Record<string, Token> = {
    'usdt': { tokenAddress: '0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT' as MoveStructId, poolAddress: '0x...' },
    'apt': { tokenAddress: '0x1::aptos_coin::AptosCoin' as MoveStructId, poolAddress: '0x...' },
    // Add other tokens as needed
};

export const getTokenByTokenName = (name: string): Token | undefined =>
    TOKEN_MAP[name.toLowerCase()];

export const getTokenByTokenAddress = (address: string): Token | undefined =>
    Object.values(TOKEN_MAP).find(token => token.tokenAddress === address); 