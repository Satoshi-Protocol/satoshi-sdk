import { PublicClient } from 'viem';

import { ProtocolConfig } from 'src/types';

export const getPreviewSwapIn = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  asset: `0x${string}`,
  amount: bigint
) => {
  if (!asset) return undefined;
  if (!amount) return undefined;

  const nymAddress = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES?.NEXUS_YIELD_MANAGER_ADDRESS;
  if (!nymAddress) return undefined;

  const [debtTokenToMintAmt, feeAmt] = (await publicClient.readContract({
    address: nymAddress,
    abi: protocolConfig.ABI.NEXUS_YIELD_MANAGER,
    functionName: 'previewSwapIn',
    args: [asset, amount],
  })) as [bigint, bigint];
  return {
    debtTokenToMintAmt,
    feeAmt,
  };
};

export const getPreviewSwapOut = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  asset: `0x${string}`,
  amount: bigint
) => {
  if (!asset) return undefined;
  if (!amount) return undefined;
  if (!protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS) return undefined;

  const nymAddress = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS;

  const [assetAmount, feeAmt] = (await publicClient.readContract({
    address: nymAddress,
    abi: protocolConfig.ABI.NEXUS_YIELD_MANAGER,
    functionName: 'previewSwapOut',
    args: [asset, amount],
  })) as [bigint, bigint];
  return {
    assetAmount,
    feeAmt,
  };
};
