/* eslint-disable @typescript-eslint/require-await */
import { parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { doNymSwapIn, doNymSwapOut } from 'src/core/operation/doNymSwap';

import { MOCK_BEVM_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import { DEBT_TOKEN_DECIMALS, getPublicClientByConfig, getWalletClientByConfig } from '../src';
jest.setTimeout(60 * 1000);

describe('NYM', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  describe('swapIn', () => {
    it('doNymSwapIn', async () => {
      const publicClient = getPublicClientByConfig(protocolConfig);

      const privateKey = MOCK_ACCOUNT_MAP.account1.priv;
      const address = MOCK_ACCOUNT_MAP.account1.address;
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = getWalletClientByConfig(protocolConfig, account);
      const assetInfo = protocolConfig.SWAP_TOKEN_LIST[0];

      const txHash = await doNymSwapIn({
        publicClient,
        walletClient,
        protocolConfig,
        asset: assetInfo.address,
        assetAmount: parseUnits('10', assetInfo.decimals),
        assetDecimals: assetInfo.decimals,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      expect(walletClient.account.address).toBe(address);
      expect(receipt.status).toBe('success');
    });
  });

  describe('swapOut', () => {
    it('doNymSwapOut', async () => {
      const publicClient = getPublicClientByConfig(protocolConfig);

      const privateKey = MOCK_ACCOUNT_MAP.account1.priv;
      const address = MOCK_ACCOUNT_MAP.account1.address;
      const account = privateKeyToAccount(privateKey as `0x${string}`);
      const walletClient = getWalletClientByConfig(protocolConfig, account);
      const assetInfo = protocolConfig.SWAP_TOKEN_LIST[0];

      const txHash = await doNymSwapOut({
        publicClient,
        walletClient,
        protocolConfig,
        asset: assetInfo.address,
        assetDecimals: assetInfo.decimals,
        satAmount: parseUnits('10', DEBT_TOKEN_DECIMALS),
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      expect(walletClient.account.address).toBe(address);
      expect(receipt.status).toBe('success');
    });
  });
});
