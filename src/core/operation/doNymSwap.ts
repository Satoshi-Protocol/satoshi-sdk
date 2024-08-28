import { PublicClient, WalletClient, parseUnits } from 'viem';

import { DEBT_TOKEN_DECIMALS } from '../../config';
import { ProtocolConfig } from '../../types';
import { getDebtTokenDailyMintCapRemain } from '../nym/getDebtTokenDailyMintCapRemain';
import { getDebtTokenMinted } from '../nym/getDebtTokenMinted';
import { getNymPendingWithdrawInfo } from '../nym/getNymPendingWithdrawInfo';
import { getPreviewSwapIn, getPreviewSwapOut } from '../nym/getPreviewSwap';
import { getErc20Balance } from '../readContracts/erc20';
import getErc20AllowanceAndApprove from '../utils/getErc20AllowanceAndApprove';
import { waitTxReceipt } from '../utils/helper';
import { nymScheduleSwapOut, nymSwapIn } from '../writeContracts/nym/nexusYieldManager';

export enum ESwap {
  SWAPIN = 'SWAPIN', // receive SAT
  SWAPOUT = 'SWAPOUT', // pay in SAT
}

const MIN_AMOUNT = 1;

export const doNymSwapIn = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
  assetAmount,
  assetDecimals,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  assetAmount: bigint;
  assetDecimals: number;
}) => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');
  if (!protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS) {
    throw new Error('This chain do not support Nexus Yield Manager');
  }

  const satAmountInfo = await getPreviewSwapIn(
    {
      publicClient,
      protocolConfig,
    },
    asset,
    assetAmount
  );

  if (!satAmountInfo) throw new Error('Cannot get preview swap in info.');

  await checkNymSwapIsValid({
    swapStatus: ESwap.SWAPIN,
    publicClient,
    protocolConfig,
    asset,
    assetDecimals,
    receiver: walletClient.account.address,
    satAmount: satAmountInfo.debtTokenToMintAmt,
    assetAmount,
  });

  await getErc20AllowanceAndApprove({
    walletClient,
    publicClient,
    tokenAddr: asset,
    amount: assetAmount,
    owner: walletClient.account.address,
    spender: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS,
  });

  const hash = await nymSwapIn({
    publicClient,
    walletClient,
    protocolConfig,
    asset: asset,
    receiver: walletClient.account.address,
    assetAmount,
  });
  const receipt = await waitTxReceipt({ publicClient }, hash);

  return receipt;
};

export const doNymSwapOut = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
  assetDecimals,
  satAmount,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  assetDecimals: number;
  satAmount: bigint;
}) => {
  const { NEXUS_YIELD_MANAGER_ADDRESS = '', DEBT_TOKEN_ADDRESS = '' } = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES;

  if (!walletClient.account) throw new Error('Wallet client account is undefined');
  if (!NEXUS_YIELD_MANAGER_ADDRESS) {
    throw new Error('This chain do not support Nexus Yield Manager');
  }
  if (!DEBT_TOKEN_ADDRESS) throw new Error('Debt token address is undefined');

  const assetAmountInfo = await getPreviewSwapOut(
    {
      publicClient,
      protocolConfig,
    },
    asset,
    satAmount
  );
  if (!assetAmountInfo) throw new Error('cannot get assetAmount');

  await checkNymSwapIsValid({
    swapStatus: ESwap.SWAPOUT,
    publicClient,
    protocolConfig,
    asset,
    assetDecimals,
    receiver: walletClient.account.address,
    satAmount,
    assetAmount: assetAmountInfo.assetAmount,
  });

  await getErc20AllowanceAndApprove({
    walletClient,
    publicClient,
    tokenAddr: DEBT_TOKEN_ADDRESS,
    amount: satAmount,
    owner: walletClient.account.address,
    spender: NEXUS_YIELD_MANAGER_ADDRESS,
  });

  const hash = await nymScheduleSwapOut({
    publicClient,
    walletClient,
    protocolConfig,
    asset,
    satAmount,
  });
  const receipt = await waitTxReceipt({ publicClient }, hash);

  return receipt;
};

export const checkNymSwapIsValid = async ({
  swapStatus,
  publicClient,
  protocolConfig,
  asset,
  assetDecimals,
  receiver,
  satAmount = 0n,
  assetAmount = 0n,
}: {
  swapStatus: ESwap;
  publicClient: PublicClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  assetDecimals: number;
  receiver: `0x${string}`;
  satAmount: bigint;
  assetAmount: bigint;
}) => {
  const isSwapIn = swapStatus === ESwap.SWAPIN;
  const isSwapOut = swapStatus === ESwap.SWAPOUT;

  if (isSwapIn && assetAmount === undefined) throw new Error('Swap in asset amount is undefined');
  if (isSwapOut && satAmount === undefined) throw new Error('Swap out sat amount is undefined');

  const checkInputAmount = () => {
    const hasInValidInput = assetAmount <= 0n || satAmount <= 0n;
    if (hasInValidInput) throw new Error('Invalid input amount');

    const amount = isSwapIn ? assetAmount : satAmount;
    const minAmount = parseUnits(MIN_AMOUNT.toString(), isSwapIn ? assetDecimals : DEBT_TOKEN_DECIMALS);

    if (amount < minAmount) throw new Error(`Amount should be greater than ${MIN_AMOUNT}`);
    return;
  };

  const checkDebtUnderflow = async () => {
    if (isSwapIn) throw new Error('This function is only for swap out');

    if (satAmount === 0n) throw new Error('satAmount is 0');

    const receiveAmount = assetAmount;
    const debtTokenMinted = await getDebtTokenMinted({ publicClient, protocolConfig }, asset);
    const debtTokenMintedAmount = debtTokenMinted ? debtTokenMinted : 0n;

    if (!debtTokenMinted) throw new Error('debtTokenMinted is undefined');
    if (debtTokenMintedAmount < receiveAmount) throw new Error('Debt token minted amount is not enough');

    return;
  };

  const checkDebtSupplyEnough = async () => {
    if (isSwapOut) throw new Error('This function is only for swap in');

    const debtTokenDailyMintCapRemain = await getDebtTokenDailyMintCapRemain({ publicClient, protocolConfig }, asset);
    if (!debtTokenDailyMintCapRemain) throw new Error('debtTokenDailyMintCapRemain is undefined');

    const swapInPreviewSatAmount = satAmount;
    if (swapInPreviewSatAmount > debtTokenDailyMintCapRemain)
      throw new Error('Debt token daily mint cap is not enough');

    return;
  };

  const checkPendingWithdrawInfos = async () => {
    if (isSwapIn) throw new Error('This function is only for swap in');

    const pendingWithdraw = await getNymPendingWithdrawInfo({ publicClient, protocolConfig }, [asset], receiver);
    const hasPendingWithdraw =
      pendingWithdraw && pendingWithdraw.find(p => p.scheduledWithdrawalAmount && p.scheduledWithdrawalAmount > 0n);
    if (hasPendingWithdraw) throw new Error('There are pending withdraws');

    return;
  };

  const checkBalance = async () => {
    if (!receiver) throw new Error('receiver is undefined');

    const tokenAddress = isSwapIn ? asset : protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS;
    const amount = isSwapIn ? assetAmount : satAmount;
    const balance = await getErc20Balance({ publicClient, tokenAddr: tokenAddress }, receiver);

    if (balance === undefined) throw new Error('balance is undefined');
    if (balance < amount) throw new Error('Insufficient balance');

    return;
  };

  checkInputAmount();
  await checkBalance();

  isSwapIn && (await checkDebtSupplyEnough());

  !isSwapIn && (await Promise.all([checkDebtUnderflow(), checkPendingWithdrawInfos()]));

  return;
};
