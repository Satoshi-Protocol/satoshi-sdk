import { PublicClient, getAddress, maxUint256 } from 'viem';

import { getTroveHint } from 'api';
import { IS_TROVE_HINT_FROM_API_ENABLED, RANDOM_SEED, TRIAL_NUMBER } from 'config';
import { ProtocolConfig } from 'types';

import { calcNICR } from './calculator';
import { getApproxHint } from '../readContracts/getApproxHint';
import { getInsertPosition } from '../readContracts/getInsertPosition';
import { getNominalICR } from '../readContracts/getNominalICR';

export const getHintFromContract = async (
  {
    publicClient,
    protocolConfig,
    troveManagerAddr,
    sortedTrovesAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    troveManagerAddr: `0x${string}`;
    sortedTrovesAddr: `0x${string}`;
  },
  collateralAmt: bigint,
  totalDebtAmt: bigint
) => {
  // 債務比率
  const NICR = calcNICR(collateralAmt, totalDebtAmt);
  // const numTroves = await getNumTroves(sortedTrovesBeaconProxy);
  let approxHint;
  let i = 0;
  let end = false;
  let minNICRDiff = maxUint256;
  let minNICRDiffAddr: `0x${string}` | undefined = undefined;
  const maxLoop = 5;
  while (i < maxLoop && !end) {
    approxHint = await getApproxHint(
      {
        publicClient,
        protocolConfig,
        troveManagerAddr,
      },
      NICR,
      BigInt(TRIAL_NUMBER),
      // numTrials,
      approxHint?.latestRandomSeed ? approxHint.latestRandomSeed : BigInt(RANDOM_SEED)
    );
    const hintAddrNICR = await getNominalICR(
      {
        publicClient,
        protocolConfig,
        troveManagerAddr,
      },
      approxHint?.hintAddress
    );
    if (hintAddrNICR > NICR && hintAddrNICR - NICR < minNICRDiff) {
      minNICRDiff = hintAddrNICR - NICR;
      minNICRDiffAddr = approxHint?.hintAddress;
    }
    if (hintAddrNICR < NICR && NICR - hintAddrNICR < minNICRDiff) {
      minNICRDiff = NICR - hintAddrNICR;
      minNICRDiffAddr = approxHint?.hintAddress;
    }
    // if abs(hintAddrNICR - NICR) < 5% of NICR, break
    if (hintAddrNICR > NICR && hintAddrNICR - NICR < NICR / BigInt(20)) {
      end = true;
    }
    if (hintAddrNICR < NICR && NICR - hintAddrNICR < NICR / BigInt(20)) {
      end = true;
    }
    i++;
    /** Sleep for 500 ms to make RPC faster */
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  if (!minNICRDiffAddr) {
    return undefined;
  }
  const res = await getInsertPosition(
    {
      publicClient,
      protocolConfig,
      sortedTrovesAddr,
    },
    NICR,
    minNICRDiffAddr,
    minNICRDiffAddr
  );
  if (res) {
    const upperHint = res.upperHint;
    const lowerHint = res.lowerHint;
    return { upperHint, lowerHint };
  } else {
    return undefined;
  }
};

export const getHintFromApi = async (
  {
    publicClient,
    protocolConfig,
    sortedTrovesAddr,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    sortedTrovesAddr: `0x${string}`;
    troveManagerAddr: `0x${string}`;
  },
  borrower: string,
  collateralAmt: bigint,
  totalDebtAmt: bigint
) => {
  try {
    const NICR = calcNICR(collateralAmt, totalDebtAmt);
    const address = getAddress(borrower);
    const apiResult = await getTroveHint({
      chain: protocolConfig.API_QUERY_CHAIN,
      address,
      nicr: NICR.toString(),
      trove: troveManagerAddr,
    });
    if (apiResult && apiResult.approx) {
      const res = await getInsertPosition(
        {
          publicClient,
          protocolConfig,
          sortedTrovesAddr,
        },
        NICR,
        apiResult.approx as `0x${string}`,
        apiResult.approx as `0x${string}`
      );

      if (res) {
        const upperHint = res.upperHint;
        const lowerHint = res.lowerHint;
        return { upperHint, lowerHint };
      } else {
        return undefined;
      }
    }
    return undefined;
  } catch (error) {
    console.error('getHintFromApi', error);
    return undefined;
  }
};

export const getHint = async (
  {
    publicClient,
    protocolConfig,
    sortedTrovesAddr,
    troveManagerAddr,
  }: {
    publicClient: PublicClient;
    protocolConfig: ProtocolConfig;
    sortedTrovesAddr: `0x${string}`;
    troveManagerAddr: `0x${string}`;
  },
  payload: {
    address: string;
    totalCollAmt: bigint;
    totalDebtAmt: bigint;
  }
): Promise<{
  upperHint: `0x${string}`;
  lowerHint: `0x${string}`;
}> => {
  const getHintMethods = [
    IS_TROVE_HINT_FROM_API_ENABLED
      ? () =>
          getHintFromApi(
            {
              publicClient,
              protocolConfig,
              sortedTrovesAddr,
              troveManagerAddr,
            },
            payload.address,
            payload.totalCollAmt,
            payload.totalDebtAmt
          )
      : undefined,
    () =>
      getHintFromContract(
        {
          publicClient,
          protocolConfig,
          troveManagerAddr,
          sortedTrovesAddr,
        },
        payload.totalCollAmt,
        payload.totalDebtAmt
      ),
  ];

  for (let index = 0; index < getHintMethods.length; index++) {
    const getHint = getHintMethods[index];
    if (!getHint) continue;
    try {
      const hint = await getHint();
      if (!hint) continue;
      return hint;
    } catch (error) {
      if (index === getHintMethods.length - 1) {
        throw error;
      }
    }
  }
  throw new Error('getHint failed');
};
