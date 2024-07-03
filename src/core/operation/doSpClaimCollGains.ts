import { PublicClient, WalletClient } from 'viem';

import { ProtocolConfig } from 'src/types';

import { getDepositorCollateralGain } from '../readContracts/getDepositorCollateralGain';
import { validateOrThrow, waitTxReceipt } from '../utils/helper';
import { claimCollGains } from '../writeContracts/claimCollGains';

export const doSpClaimCollGains = async ({
  publicClient,
  walletClient,
  protocolConfig,
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  protocolConfig: ProtocolConfig;
}) => {
  validateOrThrow(!!walletClient.account, 'walletClient account is required');

  const collGains = await getDepositorCollateralGain(
    {
      publicClient,
      protocolConfig,
    },
    walletClient.account.address
  );
  validateOrThrow(
    collGains.some(v => v > 0n),
    'No collateral gains to claim'
  );

  const hash = await claimCollGains({
    publicClient,
    walletClient,
    protocolConfig,
  });
  const receipt = await waitTxReceipt({ publicClient }, hash);

  return receipt;
};
