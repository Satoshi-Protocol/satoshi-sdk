import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const getDepositorCollateralGain = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  depositorAddr: `0x${string}`
) => {
  const depositorCollateralGain = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.STABILITY_POOL_PROXY_ADDRESS,
    abi: protocolConfig.ABI.STABILITY_POOL,
    functionName: 'getDepositorCollateralGain',
    args: [depositorAddr],
  })) as bigint[];

  return depositorCollateralGain;
};
