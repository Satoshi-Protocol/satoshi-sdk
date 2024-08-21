import { PublicClient, WalletClient, parseUnits } from 'viem';

import { DEBT_TOKEN_DECIMALS } from 'src/config';
import { ProtocolConfig } from 'src/types';

import { getDebtTokenDailyMintCapRemain } from '../nym/getDebtTokenDailyMintCapRemain';
import { getDebtTokenMinted } from '../nym/getDebtTokenMinted';
import { getNymPendingWithdrawInfo } from '../nym/getNymPendingWithdrawInfo';
import { getPreviewSwapIn, getPreviewSwapOut } from '../nym/getPreviewSwap';
import { nymScheduleSwapOut, nymSwapIn } from '../writeContracts/nym/nexusYieldManager';
export enum ESwap {
  SWAPIN = 'SWAPIN', // receive SAT
  SWAPOUT = 'SWAPOUT', // pay in SAT
}

const MIN_AMOUNT = 1;
export const isNymSwapValid = async ({
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
  if (isSwapIn && assetAmount === undefined) {
    throw new Error('assetAmount is undefined');
  }
  if (isSwapOut && satAmount === undefined) {
    throw new Error('satAmount is undefined');
  }

  const debtTokenMinted = await getDebtTokenMinted({ publicClient, protocolConfig }, asset);
  const debtTokenDailyMintCapRemain = await getDebtTokenDailyMintCapRemain({ publicClient, protocolConfig }, asset);

  const isDebtUnderflow = () => {
    if (isSwapIn) return false;
    if (satAmount === 0n) return false;
    const receiveAmount = assetAmount;
    const debtTokenMintedAmount = debtTokenMinted ? debtTokenMinted : 0n;

    return !debtTokenMintedAmount || debtTokenMintedAmount < receiveAmount;
  };

  const isValidAmount = () => {
    const hasInValidInput = assetAmount <= 0n || satAmount <= 0n;
    if (hasInValidInput) return false;
    if (isSwapIn) {
      return assetAmount >= parseUnits(MIN_AMOUNT.toString(), assetDecimals);
    } else {
      return satAmount >= parseUnits(MIN_AMOUNT.toString(), DEBT_TOKEN_DECIMALS);
    }
  };

  const isExceedDailyMintCapRemain = () => {
    if (isSwapOut) return false;
    if (!debtTokenDailyMintCapRemain) return false;
    const swapInPreviewSatAmount = parseUnits(satAmount.toString(), DEBT_TOKEN_DECIMALS);

    return swapInPreviewSatAmount > debtTokenDailyMintCapRemain;
  };

  const pendingWithdraw = await getNymPendingWithdrawInfo({ publicClient, protocolConfig }, [asset], receiver);
  const isHasPendingWithdraw = pendingWithdraw ? false : pendingWithdraw!.length > 0;

  const result = !isDebtUnderflow() && isValidAmount() && !isExceedDailyMintCapRemain() && !isHasPendingWithdraw;
  return result;
};

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
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const satAmountInfo = await getPreviewSwapIn(
    {
      publicClient,
      protocolConfig,
    },
    asset,
    assetAmount
  );

  if (!satAmountInfo) throw new Error('cannot get satAmount');

  const valid = await isNymSwapValid({
    swapStatus: ESwap.SWAPIN,
    publicClient,
    protocolConfig,
    asset,
    assetDecimals,
    receiver: walletClient.account.address,
    satAmount: satAmountInfo.debtTokenToMint,
    assetAmount,
  });

  if (!valid) throw new Error('invalid swap');

  const hash = await nymSwapIn({
    publicClient,
    walletClient,
    protocolConfig,
    asset: asset,
    receiver: walletClient.account.address,
    assetAmount,
  });

  return hash;
};

export const doNymSwapOut = async ({
  publicClient,
  walletClient,
  protocolConfig,
  asset,
  assetDecimals,
  satAmount: amount,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  assetDecimals: number;
  satAmount: bigint;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const assetAmountInfo = await getPreviewSwapOut(
    {
      publicClient,
      protocolConfig,
    },
    asset,
    amount
  );

  if (!assetAmountInfo) throw new Error('cannot get assetAmount');

  const valid = await isNymSwapValid({
    swapStatus: ESwap.SWAPOUT,
    publicClient,
    protocolConfig,
    asset,
    assetDecimals,
    receiver: walletClient.account.address,
    satAmount: amount,
    assetAmount: assetAmountInfo.assetAmount,
  });

  if (!valid) throw new Error('invalid swap');

  const hash = await nymScheduleSwapOut({
    publicClient,
    walletClient,
    protocolConfig,
    asset,
    amount,
  });

  return hash;
};
