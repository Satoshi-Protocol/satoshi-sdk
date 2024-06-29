import BigNumber from 'bignumber.js';
import { parseUnits } from 'viem';

import { DEBT_TOKEN_DECIMALS, NICR_DECIMALS } from '@/config';

export const calcTotalDebtAmt = (borrowingAmt: bigint, borrowingRateWithDecay: bigint, gasCompensationNum: number) => {
  const netDebtAmt = calcNetDebtAmt(borrowingAmt, borrowingRateWithDecay);
  const gasCompensation = parseUnits(gasCompensationNum.toString(), DEBT_TOKEN_DECIMALS);
  return netDebtAmt + gasCompensation;
};

export const calcNetDebtAmt = (borrowingAmt: bigint, borrowingRateWithDecay: bigint) => {
  const borrowingFee = calcBorrowingFee(borrowingAmt, borrowingRateWithDecay);
  return borrowingAmt + borrowingFee;
};

export const calcBorrowingFee = (borrowingAmt: bigint, borrowingRateWithDecay: bigint) => {
  return (borrowingAmt * borrowingRateWithDecay) / 10n ** BigInt(DEBT_TOKEN_DECIMALS);
};

export const calcNICR = (collateralAmt: bigint, totalDebtAmt: bigint) => {
  const NICR = (collateralAmt * parseUnits('1', NICR_DECIMALS)) / totalDebtAmt;
  return NICR;
};

export const calcCR = (
  collateralAmt: bigint,
  collateralDecimals: number,
  totalDebtAmt: bigint,
  debtDecimals: number,
  collateralPrice: bigint,
  priceDecimals: number,
  CRDecimals: number
) => {
  if (
    collateralAmt === BigInt(0) ||
    totalDebtAmt === BigInt(0) ||
    collateralPrice === BigInt(0) ||
    priceDecimals === 0 ||
    CRDecimals === 0
  ) {
    return BigInt(0);
  }
  const pricedCollateral = collateralAmt * collateralPrice;
  const CR =
    (pricedCollateral * BigInt(10 ** CRDecimals) * BigInt(10 ** debtDecimals)) /
    BigInt(10 ** collateralDecimals) /
    BigInt(10 ** priceDecimals) /
    totalDebtAmt;
  return CR > BigInt(0) ? CR : BigInt(0);
};

export const calcReadableCollValToReadableBorrowDebt = (
  readableCollVal: BigNumber,
  readableBorrowingRateWithDecay: BigNumber,
  gasCompensationNum: number
) => {
  if (readableCollVal.eq(0) || readableCollVal.lt(0)) {
    return new BigNumber(0);
  }
  return readableCollVal
    .minus(gasCompensationNum) // subtract gas compensation
    .div(readableBorrowingRateWithDecay.plus(1)); // subtract borrowing fee
};

export const calcLiquidationPrice = (readableCollAmt: BigNumber, readableDebtAmt: BigNumber, minCR: number) => {
  if (readableCollAmt.eq(0) || readableCollAmt.lt(0)) {
    return new BigNumber(0);
  }
  const minCollVal = readableDebtAmt.multipliedBy(minCR);
  const liquidationPrice = minCollVal.div(readableCollAmt);
  return liquidationPrice;
};
