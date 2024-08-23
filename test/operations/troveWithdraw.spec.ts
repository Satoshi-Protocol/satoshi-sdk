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

describe(`trove withdraw: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account9.priv as `0x${string}`);
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

    satoshiClient.TroveManager.doOpenTrove({
      collateral,
      borrowingAmt,
      totalCollAmt,
    });
  });

  it('withdraw should be succedd', async () => {
    const withdrawCollAmt = parseEther('0.01');

    const receipt = await satoshiClient.TroveManager.doWithdraw({
      collateral,
      withdrawCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it('withdraw should check unsupported chain', async () => {
    const withdrawCollAmt = parseEther('0.01');
    const invalidProtocolConfig = {
      ...protocolConfig,
      CHAIN: {
        ...protocolConfig.CHAIN,
        id: 0,
      },
    };
    const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doWithdraw({
        collateral,
        withdrawCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Unsupported chain');
    }
  });

  it('withdraw should check wallet account', async () => {
    const withdrawCollAmt = parseEther('0.01');
    // @ts-ignore
    const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
    const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doWithdraw({
        collateral,
        withdrawCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('walletClient account is required');
    }
  });

  it('withdraw should check invalid collateral', async () => {
    const withdrawCollAmt = parseEther('0.01');
    const invalidCollateral = {
      ...collateral,
      ADDRESS: '0x',
    };
    try {
      await satoshiClient.TroveManager.doWithdraw({
        // @ts-ignore
        collateral: invalidCollateral,
        withdrawCollAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Collateral not found');
    }
  });
});
