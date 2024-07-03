import { PublicClient, WalletClient } from 'viem';

import { doSpClaimCollGains } from './operation/doSpClaimCollGains';
import { doSpDeposit } from './operation/doSpDeposit';
import { doSpWithdraw } from './operation/doSpWithdraw';
import { getCompoundedDebtDeposit } from './readContracts/getCompoundedDebtDeposit';
import { getDepositorCollateralGain } from './readContracts/getDepositorCollateralGain';
import { validateOrThrow } from './utils/helper';
import { ProtocolConfig } from '../types';

export class SatoshiStabilityPool {
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

  async getCollateralGains(address?: `0x${string}`) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    return await getDepositorCollateralGain(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      address || this.walletClient.account.address
    );
  }

  async getDepositAmount(address?: `0x${string}`) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    return await getCompoundedDebtDeposit(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      address || this.walletClient.account.address
    );
  }

  async doDeposit(depositAmt: bigint) {
    return await doSpDeposit({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      depositAmt,
    });
  }

  async doWithdraw(withdrawAmt: bigint) {
    return await doSpWithdraw({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      withdrawAmt,
    });
  }

  async doClaim() {
    return await doSpClaimCollGains({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
    });
  }
}
