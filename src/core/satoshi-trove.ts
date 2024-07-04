import { PublicClient, WalletClient } from 'viem';

import { doBorrow } from './operation/doBorrow';
import { doCloseTrove } from './operation/doCloseTrove';
import { doDeposit } from './operation/doDeposit';
import { doOpenTrove } from './operation/doOpenTrove';
import { doRedeem } from './operation/doRedeem';
import { doRepay } from './operation/doRepay';
import { doWithdraw } from './operation/doWithdraw';
import { getEntireDebtAndColl } from './readContracts/getEntireDebtAndColl';
import { CollateralConfig, ProtocolConfig } from '../types';

export class SatoshiTroveManager {
  public readonly walletClient: WalletClient;
  public readonly protocolConfig: ProtocolConfig;
  public readonly publicClient: PublicClient;

  constructor({
    protocolConfig,
    publicClient,
    walletClient,
  }: {
    protocolConfig: ProtocolConfig;
    publicClient: PublicClient;
    walletClient: WalletClient;
  }) {
    this.protocolConfig = protocolConfig;
    this.publicClient = publicClient;
    this.walletClient = walletClient;
  }

  async getEntireDebtAndColl(collateral: CollateralConfig, address?: `0x${string}`) {
    return await getEntireDebtAndColl(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
        troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      },
      address || this.walletClient.account!.address
    );
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

  async doRedeem(collateral: CollateralConfig, estimatedRedeemAmt: bigint) {
    return await doRedeem({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      collateral,
      estimatedRedeemAmt,
    });
  }
}
