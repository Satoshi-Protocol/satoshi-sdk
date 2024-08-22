import { PublicClient, WalletClient } from 'viem';

import { getNymPendingWithdrawInfo } from './nym/getNymPendingWithdrawInfo';
import { getPreviewSwapIn, getPreviewSwapOut } from './nym/getPreviewSwap';
import { doNymSwapIn, doNymSwapOut } from './operation/doNymSwap';
import { doNymWithdraw } from './operation/doNymWithdraw';
import { validateOrThrow } from './utils/helper';
import { ProtocolConfig, Token } from '../types';

export class SatoshiNexusYieldModule {
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

  async getNymPendingWithdrawInfo(assetInfos: Token[]) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    return await getNymPendingWithdrawInfo(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      assetInfos.map(assetInfo => assetInfo.address),
      this.walletClient.account.address
    );
  }

  async getPreviewSwapIn(assetInfo: Token, assetAmount: bigint) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    return await getPreviewSwapIn(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      assetInfo.address,
      assetAmount
    );
  }

  async getPreviewSwapOut(assetInfo: Token, satAmount: bigint) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    return await getPreviewSwapOut(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      assetInfo.address,
      satAmount
    );
  }

  async doNymSwapIn(assetInfo: Token, assetAmount: bigint) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    return await doNymSwapIn({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      asset: assetInfo.address,
      assetAmount,
      assetDecimals: assetInfo.decimals,
    });
  }

  async doNymSwapOut(assetInfo: Token, satAmount: bigint) {
    return await doNymSwapOut({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      asset: assetInfo.address,
      assetDecimals: assetInfo.decimals,
      satAmount,
    });
  }

  async doNymWithdraw(assetInfo: Token) {
    return await doNymWithdraw({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      asset: assetInfo.address,
    });
  }
}
