import { PublicClient, WalletClient, parseUnits } from 'viem';

import { DEBT_TOKEN_DECIMALS } from '../../config';
import { ProtocolConfig } from '../../types';
import { getDebtTokenDailyMintCapRemain } from '../nym/getDebtTokenDailyMintCapRemain';
import { getDebtTokenMinted } from '../nym/getDebtTokenMinted';
import { getNymPendingWithdrawInfo } from '../nym/getNymPendingWithdrawInfo';
import { getPreviewSwapIn, getPreviewSwapOut } from '../nym/getPreviewSwap';
import { approveErc20, getErc20Allowance, getErc20Balance } from '../readContracts/erc20';
import { waitTxReceipt } from '../utils/helper';
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

  const getIsDebtUnderflow = async () => {
    if (isSwapIn) return false;
    if (satAmount === 0n) return false;
    const receiveAmount = assetAmount;
    const debtTokenMinted = await getDebtTokenMinted({ publicClient, protocolConfig }, asset);
    const debtTokenMintedAmount = debtTokenMinted ? debtTokenMinted : 0n;

    return !debtTokenMintedAmount || debtTokenMintedAmount < receiveAmount;
  };

  const getIsValidAmount = () => {
    const hasInValidInput = assetAmount <= 0n || satAmount <= 0n;
    if (hasInValidInput) return false;
    if (isSwapIn) {
      return assetAmount >= parseUnits(MIN_AMOUNT.toString(), assetDecimals);
    } else {
      return satAmount >= parseUnits(MIN_AMOUNT.toString(), DEBT_TOKEN_DECIMALS);
    }
  };

  const getIsExceedDailyMintCapRemain = async () => {
    if (isSwapOut) return false;
    const debtTokenDailyMintCapRemain = await getDebtTokenDailyMintCapRemain({ publicClient, protocolConfig }, asset);
    if (!debtTokenDailyMintCapRemain) return false;
    const swapInPreviewSatAmount = satAmount;

    return swapInPreviewSatAmount > debtTokenDailyMintCapRemain;
  };

  const getIsHasPendingWithdraw = async () => {
    if (isSwapOut) return false;
    const pendingWithdraw = await getNymPendingWithdrawInfo({ publicClient, protocolConfig }, [asset], receiver);
    if (!pendingWithdraw) return false;
    return pendingWithdraw.length > 0;
  };

  const getIsOutOfBalance = async () => {
    if (isSwapIn) {
      const currentAssetBalance = await getErc20Balance(
        {
          publicClient,
          tokenAddr: asset,
        },
        receiver
      );
      return currentAssetBalance < assetAmount;
    } else {
      const currentSatBalance = await getErc20Balance(
        {
          publicClient,
          tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
        },
        receiver
      );
      return currentSatBalance < satAmount;
    }
  };

  const valid =
    getIsValidAmount() &&
    !(await getIsDebtUnderflow()) &&
    !(await getIsExceedDailyMintCapRemain()) &&
    !(await getIsHasPendingWithdraw()) &&
    !(await getIsOutOfBalance());
  return valid;
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

  // check asset allowance
  const assetAllowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr: asset,
    },
    walletClient.account.address,
    protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS
  );
  if (assetAllowance < assetAmount) {
    const allowanceAmt = assetAmount - assetAllowance;
    const approveCollHash = await approveErc20(
      {
        publicClient,
        walletClient,
        tokenAddr: asset,
      },
      protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS,
      allowanceAmt
    );
    await waitTxReceipt({ publicClient }, approveCollHash);
  }

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
  satAmount,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  asset: `0x${string}`;
  assetDecimals: number;
  satAmount: bigint;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');
  if (!protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS) {
    throw new Error('This chain do not support Nexus Yield Manager');
  }

  const assetAmountInfo = await getPreviewSwapOut(
    {
      publicClient,
      protocolConfig,
    },
    asset,
    satAmount
  );
  if (!assetAmountInfo) throw new Error('cannot get assetAmount');

  const valid = await isNymSwapValid({
    swapStatus: ESwap.SWAPOUT,
    publicClient,
    protocolConfig,
    asset,
    assetDecimals,
    receiver: walletClient.account.address,
    satAmount,
    assetAmount: assetAmountInfo.assetAmount,
  });

  if (!valid) throw new Error('invalid swap');

  // check asset allowance
  const satAllowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
    },
    walletClient.account.address,
    protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS
  );
  if (satAllowance < satAmount) {
    const allowanceAmt = satAmount - satAllowance;
    const approveCollHash = await approveErc20(
      {
        publicClient,
        walletClient,
        tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
      },
      protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.NEXUS_YIELD_MANAGER_ADDRESS,
      allowanceAmt
    );
    await waitTxReceipt({ publicClient }, approveCollHash);
  }

  const hash = await nymScheduleSwapOut({
    publicClient,
    walletClient,
    protocolConfig,
    asset,
    satAmount,
  });

  return hash;
};
