import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'src/types';

import { getNymPendingWithdrawInfo } from '../nym/getNymPendingWithdrawInfo';
import { nymWithdraw } from '../writeContracts/nym/nexusYieldManager';
import { waitTxReceipt } from '../utils/helper';

export const doNymWithdraw = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
}) => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const pendingInfos = await getNymPendingWithdrawInfo(
    {
      publicClient,
      protocolConfig,
    },
    [asset],
    walletClient.account.address
  );
  if (!pendingInfos || pendingInfos.length === 0) {
    throw new Error('No pending withdraw');
  }
  const pendingInfo = pendingInfos[0];
  if (pendingInfo.scheduledWithdrawalAmount === 0n) {
    throw new Error('No scheduled withdrawal amount');
  }

  const nowTimestamp = Math.floor(Date.now() / 1000);
  if (pendingInfo.withdrawalTime > BigInt(nowTimestamp)) {
    throw new Error('Withdrawal time is not reached');
  }

  const hash = await nymWithdraw({
    publicClient,
    walletClient,
    protocolConfig,
    asset,
  });
  const receipt = await waitTxReceipt({ publicClient }, hash);

  return receipt;
};
