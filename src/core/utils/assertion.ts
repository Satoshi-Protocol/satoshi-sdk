import BigNumber from 'bignumber.js';
import { parseUnits } from 'viem';

import { calcTokenUsdValue } from './calculator';
import { validateOrThrow } from './helper';
import { DEBT_TOKEN_DECIMALS } from '../../config';

export function assertMinBorrowingAmount({
  formattedMinBorrowingAmt,
  borrowingAmt,
}: {
  formattedMinBorrowingAmt: number;
  borrowingAmt: bigint;
}) {
  const minBorrowingAmount = parseUnits(formattedMinBorrowingAmt.toString(), DEBT_TOKEN_DECIMALS);
  validateOrThrow(borrowingAmt >= minBorrowingAmount, 'Borrowing amount is too low');
}

export function assertCR({
  minCrPercentage,
  totalCollAmt,
  totalDebtAmt,
  collDecimals,
  collUsdPrice,
}: {
  minCrPercentage: number;
  collUsdPrice: bigint;
  collDecimals: number;
  totalCollAmt: bigint;
  totalDebtAmt: bigint;
}) {
  const tokenValue = calcTokenUsdValue({
    tokenAmt: totalCollAmt,
    tokenUsdPrice: collUsdPrice,
    tokenDecimals: collDecimals,
  });
  const minCR = new BigNumber(minCrPercentage).times(100);
  const CR = new BigNumber(tokenValue.toString()).times(100).dividedBy(totalDebtAmt.toString());
  validateOrThrow(CR.gte(minCR), 'CR is too low');
}
