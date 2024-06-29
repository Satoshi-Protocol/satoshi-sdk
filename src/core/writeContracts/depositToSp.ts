import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'types';

export const depositToSp = async ({
  publicClient,
  walletClient,
  protocolConfig,
  depositAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  depositAmt: bigint;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.STABILITY_POOL_PROXY_ADDRESS,
    abi: protocolConfig?.ABI.STABILITY_POOL,
    functionName: 'provideToSP',
    args: [depositAmt],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};
