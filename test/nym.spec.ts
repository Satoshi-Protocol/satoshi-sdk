import { defineChain, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import {
  DEBT_TOKEN_DECIMALS,
  ProtocolConfigMap,
  SatoshiClient,
  getPublicClientByConfig,
  getWalletClientByConfig,
} from '../src';
import { getErc20Balance } from '../src/core/readContracts/erc20';
jest.setTimeout(60 * 1000);

describe('NYM', () => {
  const mock_bob_mainnet = defineChain({
    id: 60808,
    name: 'BOB',
    nativeCurrency: {
      decimals: 18,
      name: 'Ethereum',
      symbol: 'ETH',
    },
    rpcUrls: {
      default: {
        http: ['http://127.0.0.1:8545'],
        webSocket: [],
      },
      public: {
        http: ['http://127.0.0.1:8545'],
        webSocket: [],
      },
    },
    blockExplorers: {
      default: { name: 'Explorer', url: 'https://explorer.gobob.xyz' },
    },
    contracts: {},
  });

  const protocolConfig = ProtocolConfigMap.BOB_MAINNET;
  protocolConfig.CHAIN = mock_bob_mainnet;
  const privateKey = MOCK_ACCOUNT_MAP.fork_account.priv;
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const assetInfo = protocolConfig.SWAP_TOKEN_LIST.find(t => t.symbol === 'USDC')!;
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);
  const NYM = satoshiClient.NexusYieldModule;
  describe('swapIn', () => {
    it('doNymSwapIn', async () => {
      const assetAmount = parseUnits('10', assetInfo.decimals);
      const satBalanceBefore = await getErc20Balance(
        {
          publicClient,
          tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
        },
        walletClient.account.address
      );

      const satAmountInfo = await NYM.getPreviewSwapIn(assetInfo, assetAmount);
      expect(satAmountInfo).toBeDefined();
      const expectedSatBalanceReceived = satAmountInfo!.debtTokenToMint;

      const txHash = await NYM.doNymSwapIn(assetInfo, assetAmount);

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      expect(receipt.status).toBe('success');

      const satBalanceAfter = await getErc20Balance(
        {
          publicClient,
          tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
        },
        walletClient.account.address
      );
      expect(satBalanceAfter - satBalanceBefore).toBe(expectedSatBalanceReceived);
    });
  });

  describe('swapOut', () => {
    it('doNymSwapOut', async () => {
      const satBalanceBefore = await getErc20Balance(
        {
          publicClient,
          tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
        },
        walletClient.account.address
      );

      const satAmount = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const txHash = await NYM.doNymSwapOut(assetInfo, satAmount);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const satBalanceAfter = await getErc20Balance(
        {
          publicClient,
          tokenAddr: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.DEBT_TOKEN_ADDRESS,
        },
        walletClient.account.address
      );

      expect(receipt.status).toBe('success');
      expect(satBalanceBefore - satBalanceAfter).toBe(satAmount);
    });

    it('doNymWithdraw', async () => {
      const pendingInfos = await NYM.getNymPendingWithdrawInfo([assetInfo]);
      expect(pendingInfos).toBeDefined();
      expect(pendingInfos!.length).toBe(1);
      const pendingInfo = pendingInfos![0];
      expect(pendingInfo.scheduledWithdrawalAmount > 0n).toBe(true);

      const withdrawTime = pendingInfo.withdrawalTime;
      expect(withdrawTime > 0n).toBe(true);
      await publicClient.request({
        method: 'evm_setNextBlockTimestamp' as unknown as any,
        params: [`0x${withdrawTime.toString(16)}`],
      });
      await publicClient.request({
        method: 'evm_mine' as unknown as any,
        params: [] as any,
      });
      jest.useFakeTimers();
      jest.setSystemTime(Number(pendingInfo.withdrawalTime) * 1000);

      const assetBalanceBefore = await getErc20Balance(
        {
          publicClient,
          tokenAddr: assetInfo.address,
        },
        walletClient.account.address
      );

      const txHash = await NYM.doNymWithdraw(assetInfo);
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const assetBalanceAfter = await getErc20Balance(
        {
          publicClient,
          tokenAddr: assetInfo.address,
        },
        walletClient.account.address
      );

      expect(receipt.status).toBe('success');
      expect(assetBalanceAfter - assetBalanceBefore).toBe(pendingInfo.scheduledWithdrawalAmount);
    });
  });
});
