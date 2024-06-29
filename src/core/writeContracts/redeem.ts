import { PublicClient, WalletClient, parseUnits } from 'viem';

import { DEFAULT_MAX_REDEMPTION_FEE_PERCENTAGE, FEE_PERCENTAGE_DECIMALS } from 'config';
import { CollateralConfig, ProtocolConfig } from 'types';

export type RedemptionHintType = {
  redemptionHints: {
    firstRedemptionHint: `0x${string}`;
    partialRedemptionHintNICR: bigint;
    truncatedDebtAmount: bigint;
  };
  upperHint: `0x${string}`;
  lowerHint: `0x${string}`;
};

export const redeem = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  estimatedRedeemAmt,
  hint,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  estimatedRedeemAmt: bigint;
  hint: RedemptionHintType;
}): Promise<`0x${string}`> => {
  switch (protocolConfig.CHAIN.id) {
    // case CONFIG.CORE_TESTNET.CHAIN_ID:
    //   return redeemOnCore({
    //     protocolConfig,
    //     collateral,
    //     estimatedRedeemAmt,
    //     hint,
    //   });
    default:
      return _redeem({
        publicClient,
        walletClient,
        protocolConfig,
        collateral,
        estimatedRedeemAmt,
        hint,
      });
  }
};

// export const redeemOnCore = async ({
//   protocolConfig,
//   collateral,
//   estimatedRedeemAmt,
//   hint,
// }: {
//   protocolConfig: ProtocolConfig;
//   collateral: CollateralConfig;
//   estimatedRedeemAmt: bigint;
//   hint: Hint;
// }): Promise<`0x${string}`> => {
//   if (collateral.PYTH_PRICE_ID === undefined) {
//     throw new Error('Collateral does not have a price id');
//   }
//   const priceIds = [collateral.PYTH_PRICE_ID];
//   const priceUpdateData = await pythConnection.getPriceFeedsUpdateData(priceIds);
//   const feeAmount = await getPythFeeAmount(protocolConfig.ORACLE_PYTH_ADDRESS, priceUpdateData as `0x${string}`[]);

//   const simulateResult = await simulateContract(wagmiConfig, {
//     address: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
//     abi: protocolConfig.ABI.TROVE_MANAGER,
//     functionName: 'redeemCollateralWithPythPriceUpdate',
//     args: [
//       estimatedRedeemAmt,
//       hint.redemptionHints.firstRedemptionHint,
//       hint.upperHint,
//       hint.lowerHint,
//       hint.redemptionHints.partialRedemptionHintNICR,
//       BigInt(0),
//       parseUnits(CONFIG.DEFAULT_MAX_REDEMPTION_FEE_PERCENTAGE.toString(), CONFIG.FEE_PERCENTAGE_DECIMALS),
//       priceUpdateData,
//     ],
//     value: feeAmount,
//   });
//   simulateResult.request.gas = await publicClient.estimateContractGas(simulateResult.request, {
//     GAS_MULTIPLIER: protocolConfig.BO_GAS_MULTIPLIER,
//   });
//   const hash = await walletClient.writeContract(simulateResult.request);
//   const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
//     hash,
//   });

//   return hash;
// };

export const _redeem = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  estimatedRedeemAmt,
  hint,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  estimatedRedeemAmt: bigint;
  hint: RedemptionHintType;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    abi: protocolConfig.ABI.TROVE_MANAGER,
    functionName: 'redeemCollateral',
    args: [
      estimatedRedeemAmt,
      hint.redemptionHints.firstRedemptionHint,
      hint.upperHint,
      hint.lowerHint,
      hint.redemptionHints.partialRedemptionHintNICR,
      BigInt(0),
      parseUnits(DEFAULT_MAX_REDEMPTION_FEE_PERCENTAGE.toString(), FEE_PERCENTAGE_DECIMALS),
    ],
  });

  const hash = await walletClient.writeContract(simulateResult.request);
  return hash;
};
