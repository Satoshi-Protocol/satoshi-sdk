import { PublicClient, WalletClient, parseUnits } from 'viem';

import { DEFAULT_MAX_FEE_PERCENTAGE, FEE_PERCENTAGE_DECIMALS } from 'config';
import { CollateralConfig, ProtocolConfig } from 'types';

import { getHint } from '../utils/getHint';

export const borrow = async ({
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
  switch (protocolConfig.CHAIN.id) {
    // TODO: Core chain
    // case CONFIG.CORE_TESTNET.CHAIN_ID:
    //   return borrowOnCore({
    //     protocolConfig,
    //     collateral,
    //     address,
    //     borrowingAmt,
    //     totalCollAmt,
    //     totalDebtAmt,
    //   });
    default:
      return _borrow({
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

// TODO: Core chain
// export const borrowOnCore = async ({
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

//   const simulateResult = await prepareWriteContractWithHints(
//     (upperHint: string, lowerHint: string) =>
//       simulateContract(wagmiConfig, {
//         gas: protocolConfig.BO_GAS_LIMIT,
//         address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
//         abi: protocolConfig?.ABI.SATOSHI_PERIPHERY,
//         functionName: 'withdrawDebtWithPythPriceUpdate',
//         args: [
//           collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
//           parseUnits(CONFIG.DEFAULT_MAX_FEE_PERCENTAGE.toString(), CONFIG.FEE_PERCENTAGE_DECIMALS),
//           borrowingAmt,
//           upperHint,
//           lowerHint,
//           priceUpdateData,
//         ],
//         value: feeAmount,
//       }),
//     {
//       chain: protocolConfig.API_QUERY_CHAIN,
//       address,
//       hintHelpers: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS,
//       sortedTrovesBeaconProxy: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
//       troveManagerBeaconProxy: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
//       totalCollAmt,
//       totalDebtAmt,
//       collAddress: collateral.ADDRESS,
//     },
//     protocolConfig.ABI
//   );

//   simulateResult.request.gas = await publicClient.estimateContractGas(simulateResult.request, {
//     MAX_GAS: protocolConfig.BO_GAS_LIMIT,
//     GAS_MULTIPLIER: protocolConfig.BO_GAS_MULTIPLIER,
//   });
//   const hash = await walletClient.writeContract(simulateResult.request);
//   const transactionReceipt = await waitForTransactionReceipt(wagmiConfig, {
//     hash,
//   });

//   return hash;
// };

export const _borrow = async ({
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
    address: protocolConfig.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
    abi: protocolConfig.ABI.SATOSHI_PERIPHERY,
    functionName: 'withdrawDebt',
    args: [
      collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      parseUnits(DEFAULT_MAX_FEE_PERCENTAGE.toString(), FEE_PERCENTAGE_DECIMALS),
      borrowingAmt,
      upperHint,
      lowerHint,
    ],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};
