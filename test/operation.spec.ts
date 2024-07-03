/* eslint-disable @typescript-eslint/require-await */
import { parseEther, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import {
  DEBT_TOKEN_DECIMALS,
  SatoshiClient,
  getPublicClientByConfig,
  getWalletClientByConfig,
  waitTxReceipt,
  wbtcABI,
} from '../src';
jest.setTimeout(120 * 1000);

describe('writeContracts', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account1.priv as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);

  const collateral = protocolConfig.COLLATERALS[0];
  it(`doOpenTrove: (${protocolConfig.CHAIN.name})`, async () => {
    const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
    const totalCollAmt = parseEther('0.1');
    // wbtc
    const depositHash = await walletClient.writeContract({
      chain: protocolConfig.CHAIN,
      account: walletClient.account,
      address: collateral.ADDRESS,
      abi: wbtcABI,
      functionName: 'deposit',
      args: [],
      value: totalCollAmt,
    });
    await waitTxReceipt({ publicClient }, depositHash);

    const receipt = await satoshiClient.TroveManager.doOpenTrove({
      collateral,
      borrowingAmt,
      totalCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`doDeposit: (${protocolConfig.CHAIN.name})`, async () => {
    const addedCollAmt = parseEther('0.2');
    // wbtc
    const depositHash = await walletClient.writeContract({
      chain: protocolConfig.CHAIN,
      account: walletClient.account,
      address: collateral.ADDRESS,
      abi: wbtcABI,
      functionName: 'deposit',
      args: [],
      value: addedCollAmt,
    });
    await waitTxReceipt({ publicClient }, depositHash);

    const receipt = await satoshiClient.TroveManager.doDeposit({
      collateral,
      addedCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`doBorrow: (${protocolConfig.CHAIN.name})`, async () => {
    const addBorrowingAmt = parseUnits('15', DEBT_TOKEN_DECIMALS);

    const receipt = await satoshiClient.TroveManager.doBorrow({
      collateral,
      addBorrowingAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`doWithdraw: (${protocolConfig.CHAIN.name})`, async () => {
    const withdrawCollAmt = parseEther('0.01');

    const receipt = await satoshiClient.TroveManager.doWithdraw({
      collateral,
      withdrawCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`doRepay: (${protocolConfig.CHAIN.name})`, async () => {
    const repayAmt = parseUnits('3', DEBT_TOKEN_DECIMALS);

    const receipt = await satoshiClient.TroveManager.doRepay({
      collateral,
      repayAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`doRedeem: (${protocolConfig.CHAIN.name})`, async () => {
    const estimatedRedeemAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

    const receipt = await satoshiClient.TroveManager.doRedeem(collateral, estimatedRedeemAmt);
    expect(receipt.status).toBe('success');
  });

  describe('StabilityPool', () => {
    it(`doDeposit: (${protocolConfig.CHAIN.name})`, async () => {
      const depositAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const receipt = await satoshiClient.StabilityPool.doDeposit(depositAmt);
      expect(receipt.status).toBe('success');
    });

    it(`doWithdraw: (${protocolConfig.CHAIN.name})`, async () => {
      const withdrawAmt = parseUnits('2', DEBT_TOKEN_DECIMALS);
      const receipt = await satoshiClient.StabilityPool.doWithdraw(withdrawAmt);
      expect(receipt.status).toBe('success');
    });

    it(`doClaim: (${protocolConfig.CHAIN.name})`, async () => {
      const collaterals = satoshiClient.getCollateralConfig();
      const collateralGains = await satoshiClient.StabilityPool.getCollateralGains();
      let hasCollateralClaimable = false;
      for (let i = 0; i < collaterals.length; i++) {
        const collateral = collaterals[i];
        const gain = collateralGains[i];
        console.log({
          name: collateral.NAME,
          gain: gain.toString(),
        });
        if (gain > 0n) {
          hasCollateralClaimable = true;
        }
      }
      if (hasCollateralClaimable) {
        const receipt = await satoshiClient.StabilityPool.doClaim();
        expect(receipt.status).toBe('success');
      }
    });
  });
});
