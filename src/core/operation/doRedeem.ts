import { PublicClient, WalletClient } from 'viem';

import { MAX_ITERATIONS } from '../../config';
import { CollateralConfig, ProtocolConfig } from '../../types';
import { getPrice } from '../readContracts/getPrice';
import { getRedeemHint } from '../readContracts/getRedeemHint';
import { isSupportedChain, validateOrThrow, waitTxReceipt } from '../utils/helper';
import { redeem } from '../writeContracts/redeem';

export const doRedeem = async ({
  publicClient,
  walletClient,
  protocolConfig,
  collateral,
  estimatedRedeemAmt,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
  collateral: CollateralConfig;
  estimatedRedeemAmt: bigint;
}) => {
  // check supported chain
  validateOrThrow(isSupportedChain(protocolConfig.CHAIN.id), 'Unsupported chain');

  // check walletClient account
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  // check collateral valid
  const collaterals = protocolConfig.COLLATERALS;
  const collateralConfig = collaterals.find(c => c.ADDRESS === collateral.ADDRESS);
  validateOrThrow(!!collateralConfig, 'Collateral not found');

  // check CR
  const collUsdPrice = await getPrice(
    {
      protocolConfig,
      publicClient,
    },
    collateral.ADDRESS
  );

  const hint = await getRedeemHint(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
    },
    estimatedRedeemAmt,
    collUsdPrice,
    BigInt(MAX_ITERATIONS)
  );
  validateOrThrow(!!hint, 'No hint found');

  const txHash = await redeem({
    publicClient,
    walletClient,
    protocolConfig,
    collateral,
    estimatedRedeemAmt,
    hint,
  });
  const receipt = await waitTxReceipt({ publicClient }, txHash);
  return receipt;
};
