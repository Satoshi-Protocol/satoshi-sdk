import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from '@/types';

export const approveDelegate = async ({
  publicClient,
  walletClient,
  protocolConfig,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
}): Promise<`0x${string}`> => {
  if (walletClient.account === undefined) throw new Error('Wallet client account is undefined');
  const result = await publicClient.simulateContract({
    account: walletClient.account,
    address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.BORROWER_OPERATIONS_PROXY_ADDRESS,
    abi: protocolConfig?.ABI.BORROWER_OPERATIONS,
    functionName: 'setDelegateApproval',
    args: [protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS, true],
  });

  const hash = await walletClient.writeContract(result.request);

  return hash;
};
