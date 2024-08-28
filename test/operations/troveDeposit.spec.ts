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

describe(`trove deposit: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account5.priv as `0x${string}`);
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

  it('deposit should be success', async () => {
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

  it('deposit should check unsupported chain', async () => {
    const addedCollAmt = parseEther('0.2');
    const invalidProtocolConfig = {
      ...protocolConfig,
      CHAIN: {
        ...protocolConfig.CHAIN,
        id: 0,
      },
    };
    const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doDeposit({
        collateral,
        addedCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Unsupported chain');
    }
  });

  it('deposit should check wallet account', async () => {
    const addedCollAmt = parseEther('0.2');
    // @ts-ignore
    const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
    const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doDeposit({
        collateral,
        addedCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('walletClient account is required');
    }
  });

  it('deposit should check invalid collateral', async () => {
    const addedCollAmt = parseEther('0.2');
    const invalidCollateral = {
      ...collateral,
      ADDRESS: '0x',
    };
    try {
      await satoshiClient.TroveManager.doDeposit({
        // @ts-ignore
        collateral: invalidCollateral,
        addedCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Collateral not found');
    }
  });

  it('deposit should check coll balance', async () => {
    const addedCollAmt = parseEther('10001');

    try {
      await satoshiClient.TroveManager.doDeposit({
        collateral,
        addedCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Insufficient addedCollAmt balance');
    }
  });
});
