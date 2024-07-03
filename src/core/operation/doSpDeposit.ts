import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'src/types';

import { getErc20Allowance, getErc20Balance } from '../readContracts/erc20';
import { validateOrThrow, waitTxReceipt } from '../utils/helper';
import { depositToSp } from '../writeContracts/depositToSp';

export const doSpDeposit = async ({
  publicClient,
  walletClient,
  protocolConfig,
  depositAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  depositAmt: bigint;
}) => {
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  // check sat balance
  const tokenAddr = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS;
  const satBalance = await getErc20Balance(
    {
      publicClient,
      tokenAddr,
    },
    walletClient.account.address
  );
  validateOrThrow(satBalance >= depositAmt, 'Insufficient SAT balance');

  const allowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr,
    },
    walletClient.account.address,
    protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.STABILITY_POOL_PROXY_ADDRESS
  );
  validateOrThrow(allowance >= depositAmt, 'Insufficient allowance');

  const hash = await depositToSp({
    publicClient,
    walletClient,
    protocolConfig,
    depositAmt,
  });
  const receipt = await waitTxReceipt({ publicClient }, hash);

  return receipt;
};
