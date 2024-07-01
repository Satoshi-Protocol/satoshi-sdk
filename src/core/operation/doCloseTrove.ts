import { PublicClient, WalletClient } from 'viem';

import { CollateralConfig, ProtocolConfig } from '../../types';
import { approveErc20, getErc20Allowance, getErc20Balance } from '../readContracts/erc20';
import { getEntireDebtAndColl } from '../readContracts/getEntireDebtAndColl';
import { getIsApprovedDelegate } from '../readContracts/getIsApprovedDelegate';
import { isSupportedChain, validateOrThrow, waitTxReceipt } from '../utils/helper';
import { approveDelegate } from '../writeContracts/approveDelegate';
import { close } from '../writeContracts/close';

export const doCloseTrove = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
}) => {
  // check supported chain
  validateOrThrow(isSupportedChain(protocolConfig.CHAIN.id), 'Unsupported chain');

  // check walletClient account
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  // check collateral valid
  const collaterals = protocolConfig.COLLATERALS;
  const collateralConfig = collaterals.find(c => c.ADDRESS === collateral.ADDRESS);
  validateOrThrow(!!collateralConfig, 'Collateral not found');

  const troveInfo = await getEntireDebtAndColl(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    },
    walletClient.account.address
  );
  const repayAmt = troveInfo.debt;

  // check delegate approval
  const isApprovedDelegate = await getIsApprovedDelegate(
    {
      publicClient,
      protocolConfig,
    },
    walletClient.account.address
  );
  if (!isApprovedDelegate) {
    const approveDelegateHash = await approveDelegate({
      publicClient,
      walletClient,
      protocolConfig,
    });
    await waitTxReceipt({ publicClient }, approveDelegateHash);
  }

  // check sat balance
  const tokenAddr = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS;
  const satBalance = await getErc20Balance(
    {
      publicClient,
      tokenAddr,
    },
    walletClient.account.address
  );
  validateOrThrow(satBalance >= repayAmt, 'Insufficient SAT balance');

  const satAllowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr,
    },
    walletClient.account.address,
    protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS
  );
  if (satAllowance < repayAmt) {
    const allowanceAmt = repayAmt - satAllowance;
    const approveCollHash = await approveErc20(
      {
        publicClient,
        walletClient,
        tokenAddr,
      },
      protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
      allowanceAmt
    );
    await waitTxReceipt({ publicClient }, approveCollHash);
  }

  const txHash = await close({
    publicClient,
    walletClient,
    protocolConfig,
    collateral,
  });
  const receipt = await waitTxReceipt({ publicClient }, txHash);
  return receipt;
};
