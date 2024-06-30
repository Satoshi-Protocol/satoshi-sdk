/* eslint-disable @typescript-eslint/require-await */
import { erc20Abi, maxUint256, parseEther, parseUnits, zeroAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import {
  approveDelegate,
  DEBT_TOKEN_DECIMALS,
  getIsApprovedDelegate,
  getPublicClientByConfig,
  getTotalDebtAmt,
  getWalletClientByConfig,
  openTrove,
} from '../src';
jest.setTimeout(60 * 1000);

describe('writeContracts', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(
    protocolConfig,
    privateKeyToAccount(MOCK_ACCOUNT_MAP.account1.priv as `0x${string}`)
  );

  const collaterals = protocolConfig.COLLATERALS;
  for (const collateral of collaterals) {
    it(`openTrove: should return approx hint (${protocolConfig.CHAIN.name})`, async () => {
      const address = walletClient.account.address;
      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
      // Approve ERC20
      const allowanceColl = await publicClient.readContract({
        address: collateral.ADDRESS,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS],
      });
      const isApprovedDelegate = await getIsApprovedDelegate(
        {
          publicClient,
          protocolConfig,
        },
        address
      );
      console.log({
        allowanceColl,
        isApprovedDelegate,
      });

      if (allowanceColl < totalCollAmt) {
        const approveCollHash = await walletClient.writeContract({
          chain: protocolConfig.CHAIN,
          account: walletClient.account,
          address: collateral.ADDRESS,
          abi: erc20Abi,
          functionName: 'approve',
          args: [protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS, maxUint256],
        });
        await publicClient.waitForTransactionReceipt({
          hash: approveCollHash,
        });
        console.log({
          approveCollHash,
        });
      }

      if (!isApprovedDelegate) {
        // Approve delegate
        const approveDelegateHash = await approveDelegate({
          publicClient,
          walletClient,
          protocolConfig,
        });
        await publicClient.waitForTransactionReceipt({
          hash: approveDelegateHash,
        });
        console.log({
          approveDelegateHash,
        });
      }

      const totalDebtAmt = await getTotalDebtAmt(
        {
          publicClient,
          protocolConfig,
          troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
        },
        borrowingAmt
      );
      const referrer = zeroAddress;

      const txHash = await openTrove({
        publicClient,
        walletClient,
        protocolConfig,
        collateral,
        address,
        borrowingAmt,
        totalCollAmt,
        totalDebtAmt,
        referrer,
      });
      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });
      expect(receipt.status).toBe('success');
      expect(txHash).toBeDefined();
    });

    break;
  }
});
