import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'src/types';

import { getCompoundedDebtDeposit } from '../readContracts/getCompoundedDebtDeposit';
import { validateOrThrow, waitTxReceipt } from '../utils/helper';
import { withdrawFromSp } from '../writeContracts/withdrawFromSp';

export const doSpWithdraw = async ({
  publicClient,
  walletClient,
  protocolConfig,
  withdrawAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  withdrawAmt: bigint;
}) => {
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  const satDepositAmt = await getCompoundedDebtDeposit(
    {
      publicClient,
      protocolConfig,
    },
    walletClient.account.address
  );
  validateOrThrow(satDepositAmt >= withdrawAmt, 'Insufficient SAT balance');

  const hash = await withdrawFromSp({
    publicClient,
    walletClient,
    protocolConfig,
    withdrawAmt,
  });
  const receipt = await waitTxReceipt({ publicClient }, hash);

  return receipt;
};
