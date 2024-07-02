import { PublicClient, WalletClient } from 'viem';

import { CollateralConfig, ProtocolConfig } from '../../types';
import { getEntireDebtAndColl } from '../readContracts/getEntireDebtAndColl';
import { getIsApprovedDelegate } from '../readContracts/getIsApprovedDelegate';
import { getPrice } from '../readContracts/getPrice';
import { assertCR } from '../utils/assertion';
import { isSupportedChain, validateOrThrow, waitTxReceipt } from '../utils/helper';
import { approveDelegate } from '../writeContracts/approveDelegate';
import { borrow } from '../writeContracts/borrow';

export const doBorrow = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  addBorrowingAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  addBorrowingAmt: bigint;
}) => {
  // check supported chain
  validateOrThrow(isSupportedChain(protocolConfig.CHAIN.id), 'Unsupported chain');

  // check walletClient account
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  // check collateral valid
  const collaterals = protocolConfig.COLLATERALS;
  const collateralConfig = collaterals.find(c => c.ADDRESS === collateral.ADDRESS);
  validateOrThrow(!!collateralConfig, 'Collateral not found');

  // const CR = calcCR
  // readableCR.greaterThanOrEqualTo(collateral.MIN_CR * 100) &&
  // Number(readableBorrowingAmtStr) >=
  //   protocolConfig.MIN_BORROWING_AMOUNT &&

  const troveInfo = await getEntireDebtAndColl(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    },
    walletClient.account.address
  );
  const totalCollAmt = troveInfo.coll;
  const totalDebtAmt = troveInfo.debt + addBorrowingAmt;

  // check CR
  const collUsdPrice = await getPrice(
    {
      protocolConfig,
      publicClient,
    },
    collateral.ADDRESS
  );
  assertCR({
    minCrPercentage: collateral.MIN_CR,
    totalCollAmt,
    totalDebtAmt,
    collDecimals: collateral.DECIMALS,
    collUsdPrice,
  });

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

  const txHash = await borrow({
    publicClient,
    walletClient,
    protocolConfig,
    collateral,
    address: walletClient.account.address,
    borrowingAmt: addBorrowingAmt,
    totalCollAmt,
    totalDebtAmt,
  });
  const receipt = await waitTxReceipt({ publicClient }, txHash);
  return receipt;
};
