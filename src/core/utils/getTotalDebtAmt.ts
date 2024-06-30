import { PublicClient, parseUnits } from 'viem';

import { DEBT_TOKEN_DECIMALS } from '../../config';
import { ProtocolConfig } from '../../types';
import { getBorrowingFee } from '../readContracts/getBorrowingFee';

export const getTotalDebtAmt = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
  },
  borrowingAmt: bigint
) => {
  const borrowingFee = await getBorrowingFee(
    {
      publicClient,
      protocolConfig,
      troveManagerAddr,
    },
    borrowingAmt
  );
  const gasCompensation = parseUnits(protocolConfig.GAS_COMPENSATION.toString(), DEBT_TOKEN_DECIMALS);
  const totalDebtAmt = borrowingAmt + borrowingFee + gasCompensation;
  return totalDebtAmt;
};
