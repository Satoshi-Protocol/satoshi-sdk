import { PublicClient, WalletClient, erc20Abi } from 'viem';
import { validateOrThrow } from '../utils/helper';

export async function getErc20Balance(
  {
    publicClient,
    tokenAddr,
  }: {
    publicClient: PublicClient;
    tokenAddr: `0x${string}`;
  },
  owner: `0x${string}`
) {
  const balance = await publicClient.readContract({
    abi: erc20Abi,
    address: tokenAddr,
    functionName: 'balanceOf',
    args: [owner],
  });
  return balance;
}

export async function getErc20Allowance(
  {
    publicClient,
    tokenAddr,
  }: {
    publicClient: PublicClient;
    tokenAddr: `0x${string}`;
  },
  owner: `0x${string}`,
  spender: `0x${string}`
) {
  const allowance = await publicClient.readContract({
    abi: erc20Abi,
    address: tokenAddr,
    functionName: 'allowance',
    args: [owner, spender],
  });
  return allowance;
}

export async function approveErc20(
  {
    publicClient,
    walletClient,
    tokenAddr,
  }: {
    publicClient: PublicClient;
    walletClient: WalletClient;
    tokenAddr: `0x${string}`;
  },
  spender: `0x${string}`,
  amount: bigint
) {
  validateOrThrow(!!walletClient.account, 'Wallet client account is required');

  const hash = await walletClient.writeContract({
    chain: publicClient.chain,
    account: walletClient.account,
    abi: erc20Abi,
    address: tokenAddr,
    functionName: 'approve',
    args: [spender, amount],
  });
  return hash;
}
