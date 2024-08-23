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

  /**
   * @description Get supported assets list
   * @returns
   */
  getAssetList() {
    return this.protocolConfig.SWAP_TOKEN_LIST;
  }

  /**
   * @description Get pending withdraw infos
   * @param assets swap out assets address
   * @returns 
   */
  async getNymPendingWithdrawInfos(assets: Token[]) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');
    
    const _assets = assets.map(asset => this.getAssetInfo(asset.address)!.address);

    return await getNymPendingWithdrawInfo(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      _assets,
      this.walletClient.account.address
    );
  }

  /**
   * @description Preview swap in received amount and fee
   * @param asset asset address
   * @param amount amount
   * @returns
   */
  async getPreviewSwapIn(asset: `0x${string}`, amount: bigint) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');

    const _asset = this.getAssetInfo(asset);

    return await getPreviewSwapIn(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      _asset.address,
      amount
    );
  }

  /**
   * @description Preview swap out received amount and fee
   * @param asset asset address
   * @param amount debt token amount
   * @returns 
   */
  async getPreviewSwapOut(asset: `0x${string}`, amount: bigint) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');

    const _asset = this.getAssetInfo(asset);

    return await getPreviewSwapOut(
      {
        publicClient: this.publicClient,
        protocolConfig: this.protocolConfig,
      },
      _asset.address,
      amount
    );
  }

  /**
   * @description Swap in asset and receive debt token
   * @param asset asset address
   * @param amount swap in amount
   * @returns 
   */
  async doNymSwapIn(asset: `0x${string}`, assetAmount: bigint) {
    validateOrThrow(!!this.walletClient.account, 'walletClient account is required');

    const _asset = this.getAssetInfo(asset);

    return await doNymSwapIn({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      asset: _asset.address,
      assetAmount,
      assetDecimals: _asset.decimals,
    });
  }

  /**
   * @description Scheduled swap out asset, the asset will be able to withdraw after the scheduled time
   * @param asset received asset address
   * @param amount swap out debt token amount
   * @returns 
   */
  async doNymSwapOut(asset: `0x${string}`, satAmount: bigint) {
    const _asset = this.getAssetInfo(asset);

    return await doNymSwapOut({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      asset: _asset.address,
      assetDecimals: _asset.decimals,
      satAmount,
    });
  }

  /**
   * @description Withdraw swap out asset
   * @param asset swap out asset address
   * @returns 
   */
  async doNymWithdraw(asset: `0x${string}`) {
    const _asset = this.getAssetInfo(asset);

    return await doNymWithdraw({
      publicClient: this.publicClient,
      walletClient: this.walletClient,
      protocolConfig: this.protocolConfig,
      asset: _asset.address,
    });
  }

  /**
   * @description Get asset info and validate
   * @param asset asset address
   * @returns 
   */
  private getAssetInfo(asset: `0x${string}`) {
    const assetList = this.getAssetList();
    const result = assetList.find(t => t.address === asset);

    const helperTxt = `Supported assets: ${assetList.map(t => t.symbol).join(', ')}`;
    if(!result) throw new Error(`Invalid asset, ${helperTxt}`);

    return result;
  }
}
