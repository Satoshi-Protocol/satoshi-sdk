import { PublicClient, WalletClient } from 'viem';

import { CollateralConfig, ProtocolConfig } from '../../types';

export const close = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
}): Promise<`0x${string}`> => {
  switch (protocolConfig.CHAIN.id) {
    // case CONFIG.CORE_TESTNET.CHAIN_ID:
    //   return closeOnCore({
    //     protocolConfig,
    //     collateral,
    //   });
    default:
      return _close({
        publicClient,
        walletClient,
        protocolConfig,
        collateral,
      });
  }
};

// TODO: implement Core chain
// export const closeOnCore = async ({
//   protocolConfig,
//   collateral,
// }: {
//   protocolConfig: ProtocolConfig;
//   collateral: CollateralConfig;
// }): Promise<`0x${string}`> => {
//   if (collateral.PYTH_PRICE_ID === undefined) {
//     throw new Error('Collateral does not have a price id');
//   }
//   const priceIds = [collateral.PYTH_PRICE_ID];
//   const priceUpdateData = await pythConnection.getPriceFeedsUpdateData(priceIds);
//   const feeAmount = await getPythFeeAmount(protocolConfig.ORACLE_PYTH_ADDRESS, priceUpdateData as `0x${string}`[]);

//   const simulateResult = await simulateContract(wagmiConfig, {
//     address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
//     abi: protocolConfig?.ABI.SATOSHI_PERIPHERY,
//     functionName: 'closeTroveWithPythPriceUpdate',
//     args: [collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS, priceUpdateData],
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

export const _close = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
}): Promise<`0x${string}`> => {
  if (!walletClient.account) throw new Error('Wallet client account is undefined');

  const simulateResult = await publicClient.simulateContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: protocolConfig?.PROTOCOL_CONTRACT_ADDRESSES.SATOSHI_PERIPHERY_ADDRESS,
    abi: protocolConfig?.ABI.SATOSHI_PERIPHERY,
    functionName: 'closeTrove',
    args: [collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS],
  });

  const hash = await walletClient.writeContract(simulateResult.request);

  return hash;
};
