import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const getIsApprovedDelegate = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  address: `0x${string}`
) => {
  const isApprovedDelegate = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.BORROWER_OPERATIONS_PROXY_ADDRESS,
    abi: protocolConfig.ABI.BORROWER_OPERATIONS,
    functionName: 'isApprovedDelegate',
    args: [address, protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS],
  })) as boolean;
  return isApprovedDelegate;
};
