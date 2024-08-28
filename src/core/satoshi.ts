import { PublicClient, WalletClient } from 'viem';

import { SatoshiNexusYieldModule } from './satoshi-nym';
import { SatoshiStabilityPool } from './satoshi-sp';
import { SatoshiTroveManager } from './satoshi-trove';
import { getPublicClientByConfig } from '../network';
import { ProtocolConfig } from '../types';

export class SatoshiClient {
  public readonly walletClient: WalletClient;
  public readonly protocolConfig: ProtocolConfig;
  public readonly publicClient: PublicClient;
  public readonly StabilityPool: SatoshiStabilityPool;
  public readonly TroveManager: SatoshiTroveManager;
  public readonly NexusYieldModule: SatoshiNexusYieldModule;

  constructor(protocolConfig: ProtocolConfig, walletClient: WalletClient) {
    this.protocolConfig = protocolConfig;
    this.publicClient = getPublicClientByConfig(protocolConfig);
    this.walletClient = walletClient;

    this.StabilityPool = new SatoshiStabilityPool({
      protocolConfig,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

    this.TroveManager = new SatoshiTroveManager({
      protocolConfig,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });

    this.NexusYieldModule = new SatoshiNexusYieldModule({
      protocolConfig,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });
  }

  getCollateralConfig() {
    return this.protocolConfig.COLLATERALS;
  }
}
