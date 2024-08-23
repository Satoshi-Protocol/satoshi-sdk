/* eslint-disable @typescript-eslint/require-await */
import { parseEther, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET } from '../mock';
import { MOCK_ACCOUNT_MAP } from '../mock/account.mock';
import {
  DEBT_TOKEN_DECIMALS,
  SatoshiClient,
  getPublicClientByConfig,
  getWalletClientByConfig,
  waitTxReceipt,
  wbtcABI,
} from '../../src';

jest.setTimeout(120 * 1000);

const protocolConfig = MOCK_BEVM_MAINNET;

describe(`trove open: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account6.priv as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);

  const collateral = protocolConfig.COLLATERALS[0];
  it('trove open with invalid referrer should be failed', async () => {
    const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
    const totalCollAmt = parseEther('0.1');
    try {
      await satoshiClient.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
        referrer: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      });
    } catch (e: any) {
      expect(e.message).toBe('Referrer not match');
    }
  });

  it('trove open without referrer should be success', async () => {
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

  it('trove open with valid referrer should be success', async () => {
    const _account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account2.priv as `0x${string}`);
    const _walletClient = getWalletClientByConfig(protocolConfig, _account);
    const _satoshiProtocol = new SatoshiClient(protocolConfig, _walletClient);

    const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
    const totalCollAmt = parseEther('0.1');
    // wbtc
    const depositHash = await _walletClient.writeContract({
      chain: protocolConfig.CHAIN,
      account: _walletClient.account,
      address: collateral.ADDRESS,
      abi: wbtcABI,
      functionName: 'deposit',
      args: [],
      value: totalCollAmt,
    });
    await waitTxReceipt({ publicClient }, depositHash);

    const receipt = await _satoshiProtocol.TroveManager.doOpenTrove({
      collateral,
      borrowingAmt,
      totalCollAmt,
      referrer: account.address,
    });
    expect(receipt.status).toBe('success');
  });

  it('open trove should check unsupported chain', async () => {
    const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
    const totalCollAmt = parseEther('0.1');
    const invalidProtocolConfig = {
      ...protocolConfig,
      CHAIN: {
        ...protocolConfig.CHAIN,
        id: 0,
      },
    };
    const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Unsupported chain');
    }
  });

  it('open trove should check wallet account', async () => {
    const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
    const totalCollAmt = parseEther('0.1');
    // @ts-ignore
    const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
    const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('walletClient account is required');
    }
  });

  it('open trove should check invalid collateral', async () => {
    const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
    const totalCollAmt = parseEther('0.1');
    const invalidCollateral = {
      ...collateral,
      ADDRESS: '0x',
    };
    try {
      await satoshiClient.TroveManager.doOpenTrove({
        // @ts-ignore
        collateral: invalidCollateral,
        borrowingAmt,
        totalCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Collateral not found');
    }
  });

  it('open trove check coll balance', async () => {
    const addedCollAmt = parseEther('10001');

    try {
      await satoshiClient.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt: parseUnits('10', DEBT_TOKEN_DECIMALS),
        totalCollAmt: addedCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Insufficient coll balance');
    }
  });
});
