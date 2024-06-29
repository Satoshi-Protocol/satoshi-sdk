import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'types';

export const withdrawFromSp = async ({
  publicClient,
  walletClient,
  protocolConfig,
  withdrawAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;

  protocolConfig: ProtocolConfig;
  withdrawAmt: bigint;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.STABILITY_POOL_PROXY_ADDRESS,
    abi: protocolConfig?.ABI.STABILITY_POOL,
    functionName: 'withdrawFromSP',
    args: [withdrawAmt],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};
