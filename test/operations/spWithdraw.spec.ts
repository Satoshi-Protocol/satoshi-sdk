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

describe(`stability pool withdraw: (${protocolConfig.CHAIN.name})`, () => {
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account3.priv as `0x${string}`);
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

  it('withdraw should be success', async () => {
    const withdrawAmt = parseUnits('2', DEBT_TOKEN_DECIMALS);
    const receipt = await satoshiClient.StabilityPool.doWithdraw(withdrawAmt);
    expect(receipt.status).toBe('success');
  });
});
