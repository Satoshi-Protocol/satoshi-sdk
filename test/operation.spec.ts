/* eslint-disable @typescript-eslint/require-await */
import { parseEther, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import {
  DEBT_TOKEN_DECIMALS,
  doBorrow,
  doDeposit,
  doOpenTrove,
  doRepay,
  doWithdraw,
  getPublicClientByConfig,
  getWalletClientByConfig,
  waitTxReceipt,
  wbtcABI,
} from '../src';
jest.setTimeout(60 * 1000);

describe('writeContracts', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(
    protocolConfig,
    privateKeyToAccount(MOCK_ACCOUNT_MAP.account1.priv as `0x${string}`)
  );

  const collateral = protocolConfig.COLLATERALS[0];
  it(`openTrove: (${protocolConfig.CHAIN.name})`, async () => {
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

    const receipt = await doOpenTrove({
      publicClient,
      walletClient,
      protocolConfig,
      collateral,
      borrowingAmt,
      totalCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`deposit: (${protocolConfig.CHAIN.name})`, async () => {
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

    const receipt = await doDeposit({
      publicClient,
      walletClient,
      protocolConfig,
      collateral,
      addedCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`borrow: (${protocolConfig.CHAIN.name})`, async () => {
    const addBorrowingAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

    const receipt = await doBorrow({
      publicClient,
      walletClient,
      protocolConfig,
      collateral,
      addBorrowingAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`withdraw: (${protocolConfig.CHAIN.name})`, async () => {
    const withdrawCollAmt = parseEther('0.01');

    const receipt = await doWithdraw({
      publicClient,
      walletClient,
      protocolConfig,
      collateral,
      withdrawCollAmt,
    });
    expect(receipt.status).toBe('success');
  });

  it(`repay: (${protocolConfig.CHAIN.name})`, async () => {
    const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

    const receipt = await doRepay({
      publicClient,
      walletClient,
      protocolConfig,
      collateral,
      repayAmt,
    });
    expect(receipt.status).toBe('success');
  });
});
