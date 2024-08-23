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

jest.setTimeout(30 * 1000);

const protocolConfig = MOCK_BEVM_MAINNET;

describe(`stability pool deposit: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account3.priv as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);

  const collateral = protocolConfig.COLLATERALS[0];

  beforeAll(async () => {
    const currentPosition = await satoshiClient.TroveManager.getEntireDebtAndColl(collateral, account.address);
    const { debt } = currentPosition;
    if (debt > 0n) return;

    let start = Date.now();
    try {
      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
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
      console.log('depositHash time:', Date.now() - start, 'ms');
      await satoshiClient.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt
      })
      console.log('doOpenTrove time:', Date.now() - start, 'ms');
    } catch (e) {
      console.error(e);
    }
  });

  it('deposit should be success', async () => {
    const depositAmt = parseUnits('1', DEBT_TOKEN_DECIMALS);
    const receipt = await satoshiClient.StabilityPool.doDeposit(depositAmt);
    expect(receipt.status).toBe('success');
  });

  it('deposit should check SAT balance', async () => {
    const depositAmt = parseUnits('10001', DEBT_TOKEN_DECIMALS);
    try {
      await satoshiClient.StabilityPool.doDeposit(depositAmt);
    } catch (e: any) {
      expect(e.message).toBe('Insufficient SAT balance');
    }
  });
});
