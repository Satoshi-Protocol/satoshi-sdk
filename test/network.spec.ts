/* eslint-disable @typescript-eslint/require-await */
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET } from './mock';
import { getPublicClientByConfig, getWalletClientByConfig } from '../src';

describe('network', () => {
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
      const privateKey = '0x430b379931b969cb0a6494af2f8b2400f456df490068f2e12e8ed8511c9412d2';
      const address = '0x3956ab541F1B35ebCD92fa9F65BCb38396b12A2E';
      const account = privateKeyToAccount(privateKey);
      const walletClient = getWalletClientByConfig(protocolConfig, account);
      expect(walletClient.account.address).toBe(address);
    });
  });
});
