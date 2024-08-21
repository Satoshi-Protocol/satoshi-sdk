import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'src/types';

export const nymSwapIn = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
  receiver,
  assetAmount,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  receiver: `0x${string}`;
  assetAmount: bigint;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS!,
    abi: protocolConfig?.ABI.NexusYieldManager,
    functionName: 'swapIn',
    args: [asset, receiver, assetAmount],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};

export const nymScheduleSwapOut = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
  amount,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  amount: bigint;
}): Promise<`0x${string}`> => {
  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS!,
    abi: protocolConfig?.ABI.NexusYieldManager,
    functionName: 'scheduleSwapOut',
    args: [asset, amount],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};

export const nymWithdraw = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
}): Promise<`0x${string}`> => {
  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS!,
    abi: protocolConfig?.ABI.NexusYieldManager,
    functionName: 'withdraw',
    args: [asset],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};