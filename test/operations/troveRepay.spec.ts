/* eslint-disable @typescript-eslint/require-await */
import { parseEther, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import {
  DEBT_TOKEN_DECIMALS,
  SatoshiClient,
  getPublicClientByConfig,
  getWalletClientByConfig,
  waitTxReceipt,
  wbtcABI,
} from '../../src';
import { MOCK_BEVM_MAINNET } from '../mock';
import { MOCK_ACCOUNT_MAP } from '../mock/account.mock';
jest.setTimeout(120 * 1000);

const protocolConfig = MOCK_BEVM_MAINNET;

describe(`trove repay: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account8.priv as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);

  const collateral = protocolConfig.COLLATERALS[0];

  beforeAll(async () => {
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

    await satoshiClient.TroveManager.doOpenTrove({
      collateral,
      borrowingAmt,
      totalCollAmt,
    });
  });

  it('repay should be success', async () => {
    const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

    const receipt = await satoshiClient.TroveManager.doRepay({
      collateral,
      repayAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it('repay should check unsupported chain', async () => {
    const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
    const invalidProtocolConfig = {
      ...protocolConfig,
      CHAIN: {
        ...protocolConfig.CHAIN,
        id: 0,
      },
    };
    const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doRepay({
        collateral,
        repayAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Unsupported chain');
    }
  });

  it('repay should check wallet account', async () => {
    const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
    // @ts-ignore
    const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
    const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doRepay({
        collateral,
        repayAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('walletClient account is required');
    }
  });

  it('repay should check invalid collateral', async () => {
    const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
    const invalidCollateral = {
      ...collateral,
      ADDRESS: '0x',
    };
    try {
      await satoshiClient.TroveManager.doRepay({
        // @ts-ignore
        collateral: invalidCollateral,
        repayAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Collateral not found');
    }
  });

  it('repay should check invalid repayAmt', async () => {
    const repayAmt = parseUnits('10001', DEBT_TOKEN_DECIMALS);
    try {
      await satoshiClient.TroveManager.doRepay({
        collateral,
        repayAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Insufficient SAT balance');
    }
  });
});
