import { PublicClient, WalletClient } from 'viem';

import { doBorrow } from './operation/doBorrow';
import { doCloseTrove } from './operation/doCloseTrove';
import { doDeposit } from './operation/doDeposit';
import { doOpenTrove } from './operation/doOpenTrove';
import { doRepay } from './operation/doRepay';
import { doWithdraw } from './operation/doWithdraw';
import { getPublicClientByConfig } from '../network';
import { CollateralConfig, ProtocolConfig } from '../types';

export class SatoshiProtocol {
  public readonly walletClient: WalletClient;
  public readonly protocolConfig: ProtocolConfig;
  public readonly publicClient: PublicClient;

  constructor(protocolConfig: ProtocolConfig, walletClient: WalletClient) {
    this.protocolConfig = protocolConfig;
    this.publicClient = getPublicClientByConfig(protocolConfig);
    this.walletClient = walletClient;
  }

  getCollateralConfig() {
    return this.protocolConfig.COLLATERALS;
  }

  async doOpenTrove({
    collateral,
    borrowingAmt,
    totalCollAmt,
    referrer,
  }: {
    collateral: CollateralConfig;
    borrowingAmt: bigint;
    totalCollAmt: bigint;
    referrer?: `0x${string}`;
  }) {
    return await doOpenTrove({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
      borrowingAmt,
      totalCollAmt,
      referrer,
    });
  }

  async doWithdraw({ collateral, withdrawCollAmt }: { collateral: CollateralConfig; withdrawCollAmt: bigint }) {
    return await doWithdraw({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
      withdrawCollAmt,
    });
  }

  async doDeposit({ collateral, addedCollAmt }: { collateral: CollateralConfig; addedCollAmt: bigint }) {
    return await doDeposit({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
      addedCollAmt,
    });
  }

  async doBorrow({ collateral, addBorrowingAmt }: { collateral: CollateralConfig; addBorrowingAmt: bigint }) {
    return await doBorrow({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
      addBorrowingAmt,
    });
  }

  async doRepay({ collateral, repayAmt }: { collateral: CollateralConfig; repayAmt: bigint }) {
    return await doRepay({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
      repayAmt,
    });
  }

  async doCloseTrove({ collateral }: { collateral: CollateralConfig }) {
    return await doCloseTrove({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
    });
  }
}
