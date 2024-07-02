import { PublicClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const getPrice = async (
  {
    publicClient,
    protocolConfig,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
  },
  collateralAddr: `0x${string}`
): Promise<bigint> => {
  const [unsafePrice] = (await publicClient.readContract({
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.PRICE_FEED_AGGREGATOR_PROXY_ADDRESS,
    abi: protocolConfig.ABI.PRICE_FEED_AGGREGATOR,
    functionName: 'fetchPriceUnsafe',
    args: [collateralAddr],
  })) as [bigint, bigint];
  return unsafePrice;
};
