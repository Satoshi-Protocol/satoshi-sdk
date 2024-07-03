/* eslint-disable @typescript-eslint/require-await */
import { parseEther, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

import { MOCK_BEVM_MAINNET, MOCK_BITLAYER_MAINNET } from './mock';
import { MOCK_ACCOUNT_MAP } from './mock/account.mock';
import {
  DEBT_TOKEN_DECIMALS,
  SatoshiClient,
  getPublicClientByConfig,
  getWalletClientByConfig,
  waitTxReceipt,
  wbtcABI,
} from '../src';
jest.setTimeout(120 * 1000);

describe('Bevm trove operations', () => {
  const protocolConfig = MOCK_BEVM_MAINNET;
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account1.priv as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);

  const collateral = protocolConfig.COLLATERALS[0];
  describe(`trove open: (${protocolConfig.CHAIN.name})`, () => {
    it('trove open with invalid referrer should be failed', async () => {
      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
      try {
        await satoshiClient.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt,
          totalCollAmt,
          referrer: '0x',
        });
      } catch (e: any) {
        expect(e.message).toBe('Referrer not match');
      }});

    it('trove open without referrer should be success', async () => {
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
  
      const receipt = await satoshiClient.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
      });
      expect(receipt.status).toBe('success');
    });

    // TODO: test failed, should be fixed and retested
    it('trove open with valid referrer should be success', async () => {
      const _account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account2.priv as `0x${string}`);
      const _walletClient = getWalletClientByConfig(protocolConfig, _account);
      const _satoshiProtocol = new SatoshiClient(protocolConfig, _walletClient);

      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
      // wbtc
      const depositHash = await _walletClient.writeContract({
        chain: protocolConfig.CHAIN,
        account: _walletClient.account,
        address: collateral.ADDRESS,
        abi: wbtcABI,
        functionName: 'deposit',
        args: [],
        value: totalCollAmt,
      });
      await waitTxReceipt({ publicClient }, depositHash);

      const receipt = await _satoshiProtocol.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
        referrer: '0xABE73bfFcd8Bc046EbD70038797f7cade4dC892F',
      });
      expect(receipt.status).toBe('success');
    });

    it('open trove should check unsupported chain', async () => {
      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt,
          totalCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('open trove should check wallet account', async () => {
      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt,
          totalCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('open trove should check invalid collateral', async () => {
      const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.1');
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        await satoshiClient.TroveManager.doOpenTrove({
          // @ts-ignore
          collateral: invalidCollateral,
          borrowingAmt,
          totalCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('open trove check coll balance', async () => {
      const addedCollAmt = parseEther('10001');

      try {
        await satoshiClient.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt: parseUnits('10', DEBT_TOKEN_DECIMALS),
          totalCollAmt: addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Insufficient coll balance');
      }
    });
  });

  describe(`trove deposit: (${protocolConfig.CHAIN.name})`, () => {
    it('deposit should be success', async () => {
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

      const receipt = await satoshiClient.TroveManager.doDeposit({
        collateral,
        addedCollAmt,
      });
      expect(receipt.status).toBe('success');
    });

    it('deposit should check unsupported chain', async () => {
      const addedCollAmt = parseEther('0.2');
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doDeposit({
          collateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('deposit should check wallet account', async () => {
      const addedCollAmt = parseEther('0.2');
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doDeposit({
          collateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('deposit should check invalid collateral', async () => {
      const addedCollAmt = parseEther('0.2');
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        await satoshiClient.TroveManager.doDeposit({
          // @ts-ignore
          collateral: invalidCollateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('deposit should check coll balance', async () => {
      const addedCollAmt = parseEther('10001');

      try {
        await satoshiClient.TroveManager.doDeposit({
          collateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Insufficient addedCollAmt balance');
      }
    });
  })

  describe(`trove borrow: (${protocolConfig.CHAIN.name})`, () => {
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

  describe(`trove withdraw: (${protocolConfig.CHAIN.name})`, () => {
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

  describe(`repay: (${protocolConfig.CHAIN.name})`, () => {
    it('repay should be success', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
  
      const receipt = await satoshiClient.TroveManager.doRepay({
        collateral,
        repayAmt,
      });
      expect(receipt.status).toBe('success');
    });

    it('repay should check unsupported chain', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doRepay({
          collateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('repay should check wallet account', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doRepay({
          collateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('repay should check invalid collateral', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        await satoshiClient.TroveManager.doRepay({
          // @ts-ignore
          collateral: invalidCollateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('repay should check invalid repayAmt', async () => {
      const repayAmt = parseUnits('10001', DEBT_TOKEN_DECIMALS);
      try {
        await satoshiClient.TroveManager.doRepay({
          collateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Insufficient SAT balance');
      }
    });
  });

  // TODO: close trove
});


describe('Bitlayer trove operations', () => {
  const protocolConfig = MOCK_BITLAYER_MAINNET;
  const account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account1.priv as `0x${string}`);
  const publicClient = getPublicClientByConfig(protocolConfig);
  const walletClient = getWalletClientByConfig(protocolConfig, account);
  const satoshiProtocol = new SatoshiClient(protocolConfig, walletClient);

  const collateral = protocolConfig.COLLATERALS[0];
  describe(`trove open: (${protocolConfig.CHAIN.name})`, () => {
    it('trove open with invalid referrer should be failed', async () => {
      const borrowingAmt = parseUnits('100', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.003');
      try {
        await satoshiProtocol.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt,
          totalCollAmt,
          referrer: '0x',
        });
      } catch (e: any) {
        expect(e.message).toBe('Referrer not match');
      }
    });

    it('trove open without referrer should be success', async () => {
      const borrowingAmt = parseUnits('100', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.002');
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
  
      const receipt = await satoshiProtocol.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
      });
      expect(receipt.status).toBe('success');
    });

    // TODO: test failed, should be fixed and retested
    it('trove open with valid referrer should be success', async () => {
      const _account = privateKeyToAccount(MOCK_ACCOUNT_MAP.account2.priv as `0x${string}`);
      const _walletClient = getWalletClientByConfig(protocolConfig, _account);
      const _satoshiProtocol = new SatoshiClient(protocolConfig, _walletClient);

      const borrowingAmt = parseUnits('100', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.002');
      // wbtc
      const depositHash = await _walletClient.writeContract({
        chain: protocolConfig.CHAIN,
        account: _walletClient.account,
        address: collateral.ADDRESS,
        abi: wbtcABI,
        functionName: 'deposit',
        args: [],
        value: totalCollAmt,
      });
      await waitTxReceipt({ publicClient }, depositHash);

      const receipt = await _satoshiProtocol.TroveManager.doOpenTrove({
        collateral,
        borrowingAmt,
        totalCollAmt,
        referrer: '0xABE73bfFcd8Bc046EbD70038797f7cade4dC892F',
      });
      expect(receipt.status).toBe('success');
    });

    it('open trove should check unsupported chain', async () => {
      const borrowingAmt = parseUnits('100', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.002');
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt,
          totalCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('open trove should check wallet account', async () => {
      const borrowingAmt = parseUnits('100', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.002');
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt,
          totalCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('open trove should check invalid collateral', async () => {
      const borrowingAmt = parseUnits('100', DEBT_TOKEN_DECIMALS);
      const totalCollAmt = parseEther('0.002');
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        await satoshiProtocol.TroveManager.doOpenTrove({
          // @ts-ignore
          collateral: invalidCollateral,
          borrowingAmt,
          totalCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('open trove check coll balance', async () => {
      const addedCollAmt = parseEther('10001');

      try {
        await satoshiProtocol.TroveManager.doOpenTrove({
          collateral,
          borrowingAmt: parseUnits('100', DEBT_TOKEN_DECIMALS),
          totalCollAmt: addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Insufficient coll balance');
      }
    });
  });

  describe(`trove deposit: (${protocolConfig.CHAIN.name})`, () => {
    it('deposit should be success', async () => {
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

      const receipt = await satoshiProtocol.TroveManager.doDeposit({
        collateral,
        addedCollAmt,
      });
      expect(receipt.status).toBe('success');
    });

    it('deposit should check unsupported chain', async () => {
      const addedCollAmt = parseEther('0.2');
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doDeposit({
          collateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('deposit should check wallet account', async () => {
      const addedCollAmt = parseEther('0.2');
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doDeposit({
          collateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('deposit should check invalid collateral', async () => {
      const addedCollAmt = parseEther('0.2');
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        await satoshiProtocol.TroveManager.doDeposit({
          // @ts-ignore
          collateral: invalidCollateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('deposit should check coll balance', async () => {
      const addedCollAmt = parseEther('10001');

      try {
        await satoshiProtocol.TroveManager.doDeposit({
          collateral,
          addedCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Insufficient addedCollAmt balance');
      }
    });
  })

  describe(`trove borrow: (${protocolConfig.CHAIN.name})`, () => {
    it('borrow should be success', async () => {
      const addBorrowingAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

      const receipt = await satoshiProtocol.TroveManager.doBorrow({
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
        await satoshiProtocol.TroveManager.doBorrow({
          // @ts-ignore
          collateral: invalidCollateral,
          addBorrowingAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });
  });

  describe(`trove withdraw: (${protocolConfig.CHAIN.name})`, () => {
    it('withdraw should be succedd', async () => {
      const withdrawCollAmt = parseEther('0.01');

      const receipt = await satoshiProtocol.TroveManager.doWithdraw({
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
        await satoshiProtocol.TroveManager.doWithdraw({
          // @ts-ignore
          collateral: invalidCollateral,
          withdrawCollAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });
  });

  describe(`trove repay: (${protocolConfig.CHAIN.name})`, () => {
    it('repay should be success', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
  
      const receipt = await satoshiProtocol.TroveManager.doRepay({
        collateral,
        repayAmt,
      });
      expect(receipt.status).toBe('success');
    });

    it('repay should check unsupported chain', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doRepay({
          collateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('repay should check wallet account', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doRepay({
          collateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('repay should check invalid collateral', async () => {
      const repayAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        await satoshiProtocol.TroveManager.doRepay({
          // @ts-ignore
          collateral: invalidCollateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('repay should check invalid repayAmt', async () => {
      const repayAmt = parseUnits('10001', DEBT_TOKEN_DECIMALS);
      try {
        await satoshiProtocol.TroveManager.doRepay({
          collateral,
          repayAmt,
        });
      } catch (e: any) {
        expect(e.message).toBe('Insufficient SAT balance');
      }
    });
  });

  describe(`trove redeem: (${protocolConfig.CHAIN.name})`, () => {
    it(`redeem should be success`, async () => {
      const estimatedRedeemAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);

      const receipt = await satoshiProtocol.TroveManager.doRedeem(collateral, estimatedRedeemAmt);
      expect(receipt.status).toBe('success');
    });

    it('redeem should check unsupported chain', async () => {
      const estimatedRedeemAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const invalidProtocolConfig = {
        ...protocolConfig,
        CHAIN: {
          ...protocolConfig.CHAIN,
          id: 0,
        },
      };
      const invalidSatoshiProtocol = new SatoshiClient(invalidProtocolConfig, walletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doRedeem(collateral, estimatedRedeemAmt);
      } catch (e: any) {
        expect(e.message).toBe('Unsupported chain');
      }
    });

    it('redeem should check wallet account', async () => {
      const estimatedRedeemAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      // @ts-ignore
      const invalidWalletClient = getWalletClientByConfig(protocolConfig, undefined);
      const invalidSatoshiProtocol = new SatoshiClient(protocolConfig, invalidWalletClient);
      try {
        await invalidSatoshiProtocol.TroveManager.doRedeem(collateral, estimatedRedeemAmt);
      } catch (e: any) {
        expect(e.message).toBe('walletClient account is required');
      }
    });

    it('redeem should check invalid collateral', async () => {
      const estimatedRedeemAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const invalidCollateral = {
        ...collateral,
        ADDRESS: '0x',
      };
      try {
        // @ts-ignore
        await satoshiProtocol.TroveManager.doRedeem(invalidCollateral, estimatedRedeemAmt);
      } catch (e: any) {
        expect(e.message).toBe('Collateral not found');
      }
    });

    it('redeem should check hint', async () => {
      const estimatedRedeemAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      try {
        // @ts-ignore
        await satoshiProtocol.TroveManager.doRedeem(collateral, estimatedRedeemAmt, '0x');
      } catch (e: any) {
        expect(e.message).toBe('No hint found');
      }
    });
  });

  describe(`stability pool deposit: ${protocolConfig.CHAIN.name}`, () => {
    it(`deposit should be success`, async () => {
      const depositAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      const receipt = await satoshiProtocol.StabilityPool.doDeposit(depositAmt);
      expect(receipt.status).toBe('success');
    });

    it('deposit should check SAT balance', async() => {
      const depositAmt = parseUnits('10001', DEBT_TOKEN_DECIMALS);
      try {
        await satoshiProtocol.StabilityPool.doDeposit(depositAmt);
      } catch (e: any) {
        expect(e.message).toBe('Insufficient SAT balance');
      }
    });

    // TODO: mock getErc20Allowance
    it('deposit should check allowence', async() => {
      // const depositAmt = parseUnits('5', DEBT_TOKEN_DECIMALS);
      // try {
      //   await satoshiProtocol.StabilityPool.doDeposit(depositAmt);
      // } catch (e: any) {
      //   expect(e.message).toBe('Insufficient allowance');
      // }
    });
  });

  describe(`stability pool withdraw: ${protocolConfig.CHAIN.name}`, () => {
    it('withdraw should be success', async () => {
      const withdrawAmt = parseUnits('2', DEBT_TOKEN_DECIMALS);
      const receipt = await satoshiProtocol.StabilityPool.doWithdraw(withdrawAmt);
      expect(receipt.status).toBe('success');
    });
  });

  describe(`stability pool claim: ${protocolConfig.CHAIN.name}`, () => {
    it('claim should be success', async () => {
      const collaterals = satoshiProtocol.getCollateralConfig();
      const collateralGains = await satoshiProtocol.StabilityPool.getCollateralGains();
      let hasCollateralClaimable = false;
      for (let i = 0; i < collaterals.length; i++) {
        const collateral = collaterals[i];
        const gain = collateralGains[i];
        console.log({
          name: collateral.NAME,
          gain: gain.toString(),
        });
        if (gain > 0n) {
          hasCollateralClaimable = true;
        }
      }
      if (hasCollateralClaimable) {
        const receipt = await satoshiProtocol.StabilityPool.doClaim();
        expect(receipt.status).toBe('success');
      }
    });
  });
});
