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

describe(`trove borrow: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account4.priv as `0x${string}`);
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

  it('borrow should be success', async () => {
    const addBorrowingAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

    const receipt = await satoshiClient.TroveManager.doBorrow({
      collateral,
      addBorrowingAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it('borrow should check unsupported chain', async () => {
    const addBorrowingAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
    const invalidProtocolConfig = {
      ...protocolConfig,
      CHAIN: {
        ...protocolConfig.CHAIN,
        id: 0,
      },
    };
    const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doBorrow({
        collateral,
        addBorrowingAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Unsupported chain');
    }
  });

  it('borrow should check wallet account', async () => {
    const addBorrowingAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
    // @ts-ignore
    const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
    const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
    try {
      await invalidSatoshiProtocol.TroveManager.doBorrow({
        collateral,
        addBorrowingAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('walletClient account is required');
    }
  });

  it('borrow should check invalid collateral', async () => {
    const addBorrowingAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
    const invalidCollateral = {
      ...collateral,
      ADDRESS: '0x',
    };
    try {
      await satoshiClient.TroveManager.doBorrow({
        // @ts-ignore
        collateral: invalidCollateral,
        addBorrowingAmt,
      });
    } catch (e: any) {
      expect(e.message).toBe('Collateral not found');
    }
  });
});
