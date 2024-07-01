import { PublicClient, WalletClient } from 'viem';

import { CollateralConfig, ProtocolConfig } from '../../types';
import { approveErc20, getErc20Allowance, getErc20Balance } from '../readContracts/erc20';
import { getEntireDebtAndColl } from '../readContracts/getEntireDebtAndColl';
import { getIsApprovedDelegate } from '../readContracts/getIsApprovedDelegate';
import { isSupportedChain, validateOrThrow, waitTxReceipt } from '../utils/helper';
import { approveDelegate } from '../writeContracts/approveDelegate';
import { deposit } from '../writeContracts/deposit';

export const doDeposit = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  addedCollAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  addedCollAmt: bigint;
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
  const totalCollAmt = troveInfo.coll + addedCollAmt;
  const totalDebtAmt = troveInfo.debt;

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

  // check collateral balance
  const collBalance = await getErc20Balance(
    {
      publicClient,
      tokenAddr: collateral.ADDRESS,
    },
    walletClient.account.address
  );
  validateOrThrow(collBalance >= addedCollAmt, 'Insufficient addedCollAmt balance');

  const collAllowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr: collateral.ADDRESS,
    },
    walletClient.account.address,
    protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS
  );
  if (collAllowance < addedCollAmt) {
    const allowanceAmt = addedCollAmt - collAllowance;
    const approveCollHash = await approveErc20(
      {
        publicClient,
        walletClient,
        tokenAddr: collateral.ADDRESS,
      },
      protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
      allowanceAmt
    );
    await waitTxReceipt({ publicClient }, approveCollHash);
  }

  const txHash = await deposit({
    publicClient,
    walletClient,
    protocolConfig,
    collateral,
    address: walletClient.account.address,
    addedCollAmt,
    totalCollAmt,
    totalDebtAmt,
  });
  const receipt = await waitTxReceipt({ publicClient }, txHash);
  return receipt;
};
