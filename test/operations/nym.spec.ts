/* eslint-disable @typescript-eslint/require-await */
import { parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_ACCOUNT_MAP } from '../mock/account.mock';
import { MOCK_BOB_MAINNET } from '../mock';
import {
  DEBT_TOKEN_DECIMALS,
  SatoshiClient,
  getPublicClientByConfig,
  getWalletClientByConfig
} from '../../src';
import { getErc20Balance } from '../../src/core/readContracts/erc20';

jest.setTimeout(60 * 1000);

const protocolConfig = MOCK_BOB_MAINNET;
const ASSET_SYMBOL = 'USDT';

describe(`NYM asset ${ASSET_SYMBOL}: (${protocolConfig.CHAIN.name})`, () => {
  const privateKey = MOCK_ACCOUNT_MAP.fork_account.priv;
  const debtAddress = protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS;

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig); 
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);

  const NYM = satoshiClient.NexusYieldModule;
  const asset = (NYM.getAssetList()).find(t => t.symbol === ASSET_SYMBOL)!;

  async function getBalanceOf(tokenAddr: `0x${string}`) {
    return await getErc20Balance(
      {
        publicClient,
        tokenAddr,
      },
      walletClient.account.address
    );
  }

  it('invalid swap amount should throw error', async () => {
    const assetAmount = parseUnits('0', asset.decimals);
    await expect(NYM.doNymSwapIn(asset.address, assetAmount)).rejects.toThrow();
  });

  it('swap amount over balance should throw error', async () => {
    const assetAmount = parseUnits('100000', asset.decimals);
    await expect(NYM.doNymSwapIn(asset.address, assetAmount)).rejects.toThrow();
  });

  it('debt underflow when swap out should throw error', async () => {
    const satAmount = 100000n;
    await expect(NYM.doNymSwapOut(asset.address, satAmount)).rejects.toThrow();
  });

  it('swap in amount above debt daily supply should throw error', async () => {
    const assetAmount = parseUnits('100000', asset.decimals);
    await expect(NYM.doNymSwapIn(asset.address, assetAmount)).rejects.toThrow();
  });

  it('swap out with pending withdraw info should throw error', async () => {
    const pendingInfos = await NYM.getNymPendingWithdrawInfos([asset]);

    if (!pendingInfos || pendingInfos.length === 0) return;

    for (const pendingInfo of pendingInfos) {
      const { scheduledWithdrawalAmount, withdrawalTime, asset } = pendingInfo;

      if (!(scheduledWithdrawalAmount > 0n) || !(withdrawalTime)) continue;

      await publicClient.request({
        method: 'evm_setNextBlockTimestamp' as unknown as any,
        params: [`0x${withdrawalTime.toString(16)}`],
      });
      await publicClient.request({
        method: 'evm_mine' as unknown as any,
        params: [] as any,
      });

      jest.useFakeTimers();
      jest.setSystemTime(Number(withdrawalTime) * 1000);

      await expect(NYM.doNymWithdraw(asset)).rejects.toThrow();
    }
  });

  it(`swap in 1 ${ASSET_SYMBOL} should be success`, async () => {
    const assetAmount = parseUnits('1', asset.decimals);
    const satBalanceBefore = await getBalanceOf(debtAddress);

    const satAmountInfo = await NYM.getPreviewSwapIn(asset.address, assetAmount);
    const expectedFeeAmt = Number(1n) * 0.0005;
    const readableFeeAmt = Number(satAmountInfo?.feeAmt);
    const expectedSatBalanceReceived = satAmountInfo!.debtTokenToMintAmt;

    expect(readableFeeAmt).toBe(expectedFeeAmt * 1e18);

    const receipt = await NYM.doNymSwapIn(asset.address, assetAmount);

    expect(receipt.status).toBe('success');

    const satBalanceAfter = await getErc20Balance(
      {
        publicClient,
        tokenAddr: debtAddress,
      },
      walletClient.account.address
    );
    expect(satBalanceAfter - satBalanceBefore).toBe(expectedSatBalanceReceived);
  });

  it('swap out 1 SAT schedule should be success', async () => {
    const satBalanceBefore = await getBalanceOf(debtAddress);
    const satAmount = parseUnits('1', DEBT_TOKEN_DECIMALS);

    const previewSwapOut = await NYM.getPreviewSwapOut(asset.address, satAmount);
    const expectedReceiveAssetAmt = Number(previewSwapOut?.assetAmount);
    const expectedFeeAmt = Number(satAmount) * 0.005;

    expect(Number(previewSwapOut?.feeAmt)).toEqual(expectedFeeAmt);
    expect(expectedReceiveAssetAmt * 1e6).toBeLessThanOrEqual(1e18 - expectedFeeAmt);

    const receipt = await NYM.doNymSwapOut(asset.address, satAmount);
    const satBalanceAfter = await getBalanceOf(debtAddress);

    expect(receipt.status).toBe('success');
    expect(satBalanceBefore - satBalanceAfter).toBe(satAmount);
  });

  it(`swap out withdraw ${ASSET_SYMBOL} should be success`, async () => {
    const pendingInfos = await NYM.getNymPendingWithdrawInfos([asset]);

    if (!pendingInfos || pendingInfos.length === 0) return;

    for (const pendingInfo of pendingInfos) {
      const { scheduledWithdrawalAmount, withdrawalTime, asset } = pendingInfo;
      const assetBalanceBefore = await getBalanceOf(asset);

      if (!(scheduledWithdrawalAmount > 0n) || !(withdrawalTime)) continue;

      await publicClient.request({
        method: 'evm_setNextBlockTimestamp' as unknown as any,
        params: [`0x${withdrawalTime.toString(16)}`],
      });
      await publicClient.request({
        method: 'evm_mine' as unknown as any,
        params: [] as any,
      });

      jest.useFakeTimers();
      jest.setSystemTime(Number(withdrawalTime) * 1000);

      const receipt = await NYM.doNymWithdraw(asset);

      expect(receipt.status).toBe('success');
      const assetBalanceAfter = await getBalanceOf(asset);

      expect(assetBalanceAfter - assetBalanceBefore).toBe(scheduledWithdrawalAmount);
    }
  });
});
