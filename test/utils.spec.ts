import BigNumber from 'bignumber.js';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import {
  calcBorrowingFee,
  calcCR,
  calcLiquidationPrice,
  calcNICR,
  calcNetDebtAmt,
  calcReadableCollValToReadableBorrowDebt,
  calcTokenUsdValue,
  calcTotalDebtAmt,
  getPublicClientByConfig,
  getWalletClientByConfig,
} from '../src';
import { assertCR, assertMinBorrowingAmount } from '../src/core/utils/assertion';
import { getHint, getHintFromApi, getHintFromContract } from '../src/core/utils/getHint';
import { getTotalDebtAmt } from '../src/core/utils/getTotalDebtAmt';
import {
  getBigInt,
  getBoolean,
  getNumber,
  getString,
  getStringArray,
  isSupportedChain,
  validateOrThrow,
} from '../src/core/utils/helper';
import { retry } from '../src/core/utils/retry';

describe('utils function', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  const publicClient = getPublicClientByConfig(protocolConfig);

  describe('assertion', () => {
    it('assertMinBorrowingAmount', () => {
      const formattedMinBorrowingAmt = 1000;
      const borrowingAmt = 1000n;

      expect(() => assertMinBorrowingAmount({ formattedMinBorrowingAmt, borrowingAmt })).toThrowError(
        'Borrowing amount is too low'
      );
    });
    it('assertCR', () => {
      const minCrPercentage = 100;
      const collUsdPrice = 1000n;
      const collDecimals = 18;
      const totalCollAmt = 1000n;
      const totalDebtAmt = 1000n;

      expect(() => assertCR({ minCrPercentage, collUsdPrice, collDecimals, totalCollAmt, totalDebtAmt })).toThrowError(
        'CR is too low'
      );
    });
  });
  describe('calculator', () => {
    it('calcTotalDebtAmt', () => {
      const borrowingAmt = 1000n;
      const borrowingFee = 100n;
      const gasCompensationNum = 0;

      expect(calcTotalDebtAmt(borrowingAmt, borrowingFee, gasCompensationNum)).toBe(1000n);
    });
    it('calcNetDebtAmt', () => {
      const borrowingAmt = 1000n;
      const borrowingRateWithDecay = 100n;

      expect(calcNetDebtAmt(borrowingAmt, borrowingRateWithDecay)).toBe(1000n);
    });
    it('calcBorrowingFee', () => {
      const borrowingAmt = 1000n;
      const borrowingRateWithDecay = 100n;

      expect(calcBorrowingFee(borrowingAmt, borrowingRateWithDecay)).toBe(0n);
    });
    it('calcTokenUsdValue', () => {
      const tokenAmt = 100n;
      const tokenUsdPrice = 1n;
      const tokenDecimals = 18;

      // TODO: fix this
      expect(calcTokenUsdValue({ tokenAmt, tokenUsdPrice, tokenDecimals })).toBe(100n);
    });
    it('calcNICR', () => {
      const collateralAmt = 1000n;
      const totalDebtAmt = 1000n;

      expect(calcNICR(collateralAmt, totalDebtAmt)).toBe(100000000000000000000n);
    });
    it('calcCR', () => {
      const collateralAmt = 1000n;
      const collateralDecimals = 18;
      const totalDebtAmt = 1000n;
      const debtDecimals = 18;
      const collateralPrice = 1000n;
      const priceDecimals = 18;
      const CRDecimals = 18;

      expect(
        calcCR(
          collateralAmt,
          collateralDecimals,
          totalDebtAmt,
          debtDecimals,
          collateralPrice,
          priceDecimals,
          CRDecimals
        )
      ).toBe(1000n);
    });
    it('calcReadableCollValToReadableBorrowDebt', () => {
      const collateralAmt = BigNumber(1000);
      const totalDebtAmt = BigNumber(1000);
      const gasCompensationNum = 18;

      expect(calcReadableCollValToReadableBorrowDebt(collateralAmt, totalDebtAmt, gasCompensationNum)).toBe(1000n);
    });
    it('calcLiquidationPrice', () => {
      const collateralAmt = BigNumber(1000);
      const totalDebtAmt = BigNumber(1000);
      const liquidationCR = 0.1;

      expect(calcLiquidationPrice(collateralAmt, totalDebtAmt, liquidationCR)).toBe(1000n);
    });
  });
  describe('getHint', () => {
    const troveManagerAddr = protocolConfig.COLLATERALS[0].TROVE_MANAGER_BEACON_PROXY_ADDRESS;
    const sortedTrovesAddr = protocolConfig.COLLATERALS[0].SORTED_TROVE_BEACON_PROXY_ADDRESS;
    it('getHintFromContract', async () => {
      const hint = await getHintFromContract(
        {
          publicClient,
          protocolConfig,
          troveManagerAddr,
          sortedTrovesAddr,
        },
        1000n,
        1000n
      );

      expect(hint).toBeDefined();
    });

    it('getHintFromApi', async () => {
      const hint = await getHintFromApi(
        {
          publicClient,
          protocolConfig,
          sortedTrovesAddr,
          troveManagerAddr,
        },
        '',
        1000n,
        1000n
      );

      expect(hint).toBeDefined();
    });

    it('getHint', async () => {
      const payload = {
        address: '',
        totalCollAmt: 1000n,
        totalDebtAmt: 1000n,
      };
      const hint = await getHint(
        {
          publicClient,
          protocolConfig,
          sortedTrovesAddr,
          troveManagerAddr,
        },
        payload
      );

      expect(hint).toBeDefined();
    });
  });
  describe('getTotalDebtAmt', () => {
    it('getTotalDebtAmt', async () => {
      const troveManagerAddr = protocolConfig.COLLATERALS[0].TROVE_MANAGER_BEACON_PROXY_ADDRESS;
      const borrowingAmt = 1n;
      const result = await getTotalDebtAmt({ publicClient, protocolConfig, troveManagerAddr }, borrowingAmt);

      expect(result).toBe(2000000000000000001n);
    });
  });
  describe('helper', () => {
    it('getBoolean', () => {
      const value = 'true';
      expect(getBoolean(value)).toBeTruthy();
    });
    it('getNumber', () => {
      const value = '1000';
      expect(getNumber(value)).toBe(1000);
    });
    it('getString', () => {
      const value = '1000';
      expect(getString(value)).toBe('1000');
    });
    it('getBigInt', () => {
      const value = '1000';
      expect(getBigInt(value)).toBe(1000n);
    });
    it('waitTxReceipt', () => {});
    it('getStringArray', () => {
      const value = '1000,2000';
      expect(getStringArray(value)).toEqual(['1000', '2000']);
    });
    it('isSupportedChain', () => {
      const chainId = protocolConfig.CHAIN.id;
      expect(isSupportedChain(chainId)).toBeTruthy();
    });
    it('validateOrThrow', () => {
      const condition = false;
      const message = 'error';
      expect(() => validateOrThrow(condition, message)).toThrowError('error');
    });
  });
  describe('retry', () => {
    it('retry', () => {
      const fn = () =>
        new Promise((resolve, reject) => {
          resolve(null);
        });
      const retryCount = 5;
      const retryDelay = 1;

      // TODO: how to test this?
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      retry(fn, retryCount, retryDelay);
      expect(retry(fn, retryCount, retryDelay)).not.toThrow();
    });
  });
});
