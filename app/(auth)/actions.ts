'use server';

import { z } from 'zod';
import { Account, Network, PrivateKey, PrivateKeyVariants, Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';

const authFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }

    return { status: 'failed' };
  }
};

export interface RegisterActionState {
  status:
  | 'idle'
  | 'in_progress'
  | 'success'
  | 'failed'
  | 'user_exists'
  | 'invalid_data';
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    const [user] = await getUser(validatedData.email);

    if (user) {
      return { status: 'user_exists' } as RegisterActionState;
    }

    // Generate a new Aptos account for the user
    const account = Account.generate();
    const rawPrivateKey = account.privateKey.toString();
    // Format the private key according to AIP-80
    const privateKey = PrivateKey.formatPrivateKey(rawPrivateKey, PrivateKeyVariants.Ed25519);

    console.log('Created new Aptos account with address:', account.accountAddress.toString());

    // Initialize Aptos client for devnet
    const config = new AptosConfig({ network: Network.MAINNET });
    const aptos = new Aptos(config);

    // Fund the account with testnet APT
    

    // Create user with email, password, and private key
    await createUser(validatedData.email, validatedData.password, privateKey);

    // Sign in with the credentials and include private key in the session
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      privateKey: privateKey,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data' };
    }
    console.error('Registration error:', error);
    return { status: 'failed' };
  }
};
