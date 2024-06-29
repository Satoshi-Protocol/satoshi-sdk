import { PublicClient, WalletClient, parseUnits, zeroAddress } from 'viem';

import { DEFAULT_MAX_FEE_PERCENTAGE, FEE_PERCENTAGE_DECIMALS, bevm_mainnet } from '../../config';
import { CollateralConfig, ProtocolConfig } from '../../types';
import { getHint } from '../utils/getHint';

export const openTrove = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  address,
  borrowingAmt,
  totalCollAmt,
  totalDebtAmt,
  referrer,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  address: `0x${string}`;
  borrowingAmt: bigint;
  totalCollAmt: bigint;
  totalDebtAmt: bigint;
  referrer?: string;
}): Promise<`0x${string}`> => {
  switch (protocolConfig.CHAIN.id) {
    // referral
    case bevm_mainnet.id:
      return openTroveOnBevm({
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
    // pull price feed
    // case CONFIG.CORE_TESTNET.CHAIN_ID:
    //   return openTroveOnCore({
    //     protocolConfig,
    //     collateral,
    //     address,
    //     borrowingAmt,
    //     totalCollAmt,
    //     totalDebtAmt,
    //   });
    default:
      return _openTrove({
        publicClient,
        walletClient,
        protocolConfig,
        collateral,
        address,
        borrowingAmt,
        totalCollAmt,
        totalDebtAmt,
      });
  }
};

export const openTroveOnBevm = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  address,
  borrowingAmt,
  totalCollAmt,
  totalDebtAmt,
  referrer,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  address: `0x${string}`;
  borrowingAmt: bigint;
  totalCollAmt: bigint;
  totalDebtAmt: bigint;
  referrer?: string;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const { upperHint, lowerHint } = await getHint(
    {
      publicClient,
      protocolConfig,
      sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
      troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    },
    {
      address,
      totalCollAmt,
      totalDebtAmt,
    }
  );

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
    abi: protocolConfig?.ABI.SATOSHI_PERIPHERY,
    functionName: 'openTrove',
    args: [
      collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      parseUnits(DEFAULT_MAX_FEE_PERCENTAGE.toString(), FEE_PERCENTAGE_DECIMALS),
      totalCollAmt,
      borrowingAmt,
      upperHint,
      lowerHint,
      !referrer ? zeroAddress : referrer,
    ],
    value: collateral.IS_NATIVE ? totalCollAmt : BigInt(0),
  });

  const hash = await walletClient.writeContract(simulateResult.request);
  return hash;
};

// export const openTroveOnCore = async ({
//   protocolConfig,
//   collateral,
//   address,
//   borrowingAmt,
//   totalCollAmt,
//   totalDebtAmt,
// }: {
//   protocolConfig: ProtocolConfig;
//   collateral: CollateralConfig;
//   address: `0x${string}`;
//   borrowingAmt: bigint;
//   totalCollAmt: bigint;
//   totalDebtAmt: bigint;
// }): Promise<`0x${string}`> => {
//   if (collateral.PYTH_PRICE_ID === undefined) {
//     throw new Error('Collateral does not have a price id');
//   }
//   const priceIds = [collateral.PYTH_PRICE_ID];
//   const priceUpdateData = await pythConnection.getPriceFeedsUpdateData(priceIds);
//   const feeAmount = await getPythFeeAmount(protocolConfig.ORACLE_PYTH_ADDRESS, priceUpdateData as `0x${string}`[]);

//   const simulateResult: any = await prepareWriteContractWithHints(
//     (upperHint: string, lowerHint: string) =>
//       simulateContract(wagmiConfig, {
//         gas: protocolConfig.BO_GAS_LIMIT,
//         address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
//         abi: protocolConfig?.ABI.SATOSHI_PERIPHERY,
//         functionName: 'openTroveWithPythPriceUpdate',
//         args: [
//           collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
//           parseUnits(CONFIG.DEFAULT_MAX_FEE_PERCENTAGE.toString(), CONFIG.FEE_PERCENTAGE_DECIMALS),
//           totalCollAmt,
//           borrowingAmt,
//           upperHint,
//           lowerHint,
//           priceUpdateData,
//         ],
//         value: collateral.IS_NATIVE ? totalCollAmt + feeAmount : feeAmount,
//       }),
//     {
//       chain: protocolConfig.API_QUERY_CHAIN,
//       address,
//       hintHelpers: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS,
//       sortedTrovesBeaconProxy: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
//       troveManagerBeaconProxy: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
//       totalCollAmt: totalCollAmt,
//       totalDebtAmt: totalDebtAmt,
//       collAddress: collateral.ADDRESS,
//     },
//     protocolConfig.ABI
//   );

//   simulateResult.request.gas = await publicClient.estimateContractGas(simulateResult.request, {
//     MAX_GAS: protocolConfig.BO_GAS_LIMIT,
//     GAS_MULTIPLIER: protocolConfig.BO_GAS_MULTIPLIER,
//   });
//   const hash = await walletClient.writeContract(simulateResult.request as unknown as any);
//   const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
//     hash,
//   });

//   return hash;
// };

export const _openTrove = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  address,
  borrowingAmt,
  totalCollAmt,
  totalDebtAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  address: `0x${string}`;
  borrowingAmt: bigint;
  totalCollAmt: bigint;
  totalDebtAmt: bigint;
}): Promise<`0x${string}`> => {
  const { upperHint, lowerHint } = await getHint(
    {
      publicClient,
      protocolConfig,
      sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
      troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
    },
    {
      address,
      totalCollAmt,
      totalDebtAmt,
    }
  );

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
    abi: protocolConfig?.ABI.SATOSHI_PERIPHERY,
    functionName: 'openTrove',
    args: [
      collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      parseUnits(DEFAULT_MAX_FEE_PERCENTAGE.toString(), FEE_PERCENTAGE_DECIMALS),
      totalCollAmt,
      borrowingAmt,
      upperHint,
      lowerHint,
    ],
    value: collateral.IS_NATIVE ? totalCollAmt : BigInt(0),
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};
