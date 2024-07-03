import { getAddress, PublicClient, WalletClient, zeroAddress } from 'viem';

import { getReferMessage, getReferrer, postSetReferrer } from '../../api';
import { CollateralConfig, ProtocolConfig } from '../../types';
import { approveErc20, getErc20Allowance, getErc20Balance } from '../readContracts/erc20';
import { getIsApprovedDelegate } from '../readContracts/getIsApprovedDelegate';
import { getPrice } from '../readContracts/getPrice';
import { assertCR, assertMinBorrowingAmount } from '../utils/assertion';
import { getTotalDebtAmt } from '../utils/getTotalDebtAmt';
import { isSupportedChain, validateOrThrow, waitTxReceipt } from '../utils/helper';
import { approveDelegate } from '../writeContracts/approveDelegate';
import { openTrove } from '../writeContracts/openTrove';

export const doOpenTrove = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  borrowingAmt,
  totalCollAmt,
  referrer,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  borrowingAmt: bigint;
  totalCollAmt: bigint;
  referrer?: `0x${string}`;
}) => {
  // check supported chain
  validateOrThrow(isSupportedChain(protocolConfig.CHAIN.id), 'Unsupported chain');

  // check walletClient account
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  // check collateral valid
  const collaterals = protocolConfig.COLLATERALS;
  const collateralConfig = collaterals.find(c => c.ADDRESS === collateral.ADDRESS);
  validateOrThrow(!!collateralConfig, 'Collateral not found');

  // check borrowing amount
  assertMinBorrowingAmount({
    formattedMinBorrowingAmt: protocolConfig.MIN_BORROWING_AMOUNT,
    borrowingAmt,
  });

  // check and set referrer
  if (referrer && referrer !== zeroAddress) {
    const referrerAddress = getAddress(referrer);
    const referrerFromApi = await getReferrer(walletClient.account.address);
    const dontHaveSetRef = !referrerFromApi || !referrerFromApi.referrer;
    const hasSetRef = referrerFromApi?.referrer && referrerFromApi.referrer !== zeroAddress;
    if (hasSetRef) {
      validateOrThrow(referrerAddress === referrerFromApi.referrer, 'Referrer not match');
    } else if (!dontHaveSetRef) {
      const setReferrerMessage = await getReferMessage(walletClient.account.address, referrerAddress);
      const signature = await walletClient.signMessage({
        message: setReferrerMessage.message,
        account: walletClient.account,
      });

      await postSetReferrer({
        address: walletClient.account.address,
        referrer: referrerAddress,
        signature,
        message: setReferrerMessage.message,
      });
    }
  }

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
  validateOrThrow(collBalance >= totalCollAmt, 'Insufficient coll balance');

  const collAllowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr: collateral.ADDRESS,
    },
    walletClient.account.address,
    protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS
  );
  if (collAllowance < totalCollAmt) {
    const allowanceAmt = totalCollAmt - collAllowance;
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

  // calc total debt amount
  const totalDebtAmt = await getTotalDebtAmt(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    },
    borrowingAmt
  );

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

  const txHash = await openTrove({
    publicClient,
    walletClient,
    protocolConfig,
    collateral,
    address: walletClient.account.address,
    borrowingAmt,
    totalCollAmt,
    totalDebtAmt,
    referrer,
  });
  const receipt = await waitTxReceipt({ publicClient }, txHash);
  return receipt;
};
