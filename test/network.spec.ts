/* eslint-disable @typescript-eslint/require-await */
import { parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET, MOCK_BITLAYER_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import { getPublicClientByConfig, getWalletClientByConfig } from '../src';
jest.setTimeout(60 * 1000);

describe('BEVM network', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  describe('publicClient', () => {
    it('getBlockNumber', async () => {
      const publicClient = getPublicClientByConfig(protocolConfig);
      const blockNumber = await publicClient.getBlockNumber();
      expect(blockNumber).toBeGreaterThan(0);
    });
  });

  describe('walletClient', () => {
    it('address', async () => {
      const publicClient = getPublicClientByConfig(protocolConfig);

      const privateKey = MOCK_ACCOUNT_MAP.account1.priv;
      const address = MOCK_ACCOUNT_MAP.account1.address;
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = getWalletClientByConfig(protocolConfig, account);
      const txHash = await walletClient.sendTransaction({
        to: MOCK_ACCOUNT_MAP.account2.address as `0x${string}`,
        value: parseEther('1'),
        data: '0x',
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      expect(walletClient.account.address).toBe(address);
      expect(receipt.status).toBe('success');
    });
  });
});

describe('Bitlayer network', () => {
  const protocolConfig = MOCK_BITLAYER_MAINNET;
  describe('publicClient', () => {
    it('getBlockNumber', async () => {
      const publicClient = getPublicClientByConfig(protocolConfig);
      const blockNumber = await publicClient.getBlockNumber();
      expect(blockNumber).toBeGreaterThan(0);
    });
  });

  describe('walletClient', () => {
    it('address', async () => {
      const privateKey = '0x430b379931b969cb0a6494af2f8b2400f456df490068f2e12e8ed8511c9412d2';
      const address = '0x3956ab541F1B35ebCD92fa9F65BCb38396b12A2E';
      const account = privateKeyToAccount(privateKey);
      const walletClient = getWalletClientByConfig(protocolConfig, account);
      expect(walletClient.account.address).toBe(address);
    });
  });
});
