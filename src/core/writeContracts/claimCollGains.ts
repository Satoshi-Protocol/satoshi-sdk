import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from '../../types';

export const claimCollGains = async ({
  publicClient,
  walletClient,
  protocolConfig,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const collateralIndexes: bigint[] = protocolConfig.COLLATERALS.map((collateral, index) => BigInt(index));
  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.STABILITY_POOL_PROXY_ADDRESS,
    abi: protocolConfig?.ABI.STABILITY_POOL,
    functionName: 'claimCollateralGains',
    args: [walletClient.account.address, collateralIndexes],
  });

  const hash = await walletClient.writeContract(simulateResult.request);
  return hash;
};
