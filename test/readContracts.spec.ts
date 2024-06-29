/* eslint-disable @typescript-eslint/require-await */
import { maxUint256, zeroAddress } from 'viem';

import {
  ProtocolConfigMap,
  RANDOM_SEED,
  TRIAL_NUMBER,
  getApproxHint,
  getBorrowingFee,
  getInsertPosition,
  getNominalICR,
  getPublicClientByConfig,
} from '../src';
jest.setTimeout(120 * 1000);

describe('readContracts', () => {
  const configs = Object.values(ProtocolConfigMap);
  for (const protocolConfig of configs) {
    const publicClient = getPublicClientByConfig(protocolConfig);

    const collaterals = protocolConfig.COLLATERALS;
    for (const collateral of collaterals) {
      it(`getApproxHint: should return approx hint (${protocolConfig.CHAIN.name})`, async () => {
        const result = await getApproxHint(
          {
            publicClient,
            protocolConfig,
            troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
          },
          123456789n,
          BigInt(TRIAL_NUMBER),
          BigInt(RANDOM_SEED)
        );

        expect(result).toBeDefined();
        expect(result?.hintAddress).toBeDefined();
        expect(result?.diff).toBeDefined();
        expect(result?.latestRandomSeed).toBeDefined();
      });

      it(`getBorrowingFee (${protocolConfig.CHAIN.name})`, async () => {
        const result = await getBorrowingFee(
          {
            publicClient,
            protocolConfig,
            troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
          },
          123456789n
        );
        expect(result > 0n).toBeTruthy();
      });

      it(`getInsertPosition: with max nicr (${protocolConfig.CHAIN.name})`, async () => {
        const result = await getInsertPosition(
          {
            publicClient,
            protocolConfig,
            sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
          },
          maxUint256,
          zeroAddress,
          zeroAddress
        );

        expect(result.upperHint).toBe(zeroAddress);
        expect(result.lowerHint.length).toBe(zeroAddress.length);
      });

      it(`getInsertPosition: with zero nicr (${protocolConfig.CHAIN.name})`, async () => {
        const result = await getInsertPosition(
          {
            publicClient,
            protocolConfig,
            sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
          },
          0n,
          zeroAddress,
          zeroAddress
        );

        expect(result.upperHint.length).toBe(zeroAddress.length);
        expect(result.lowerHint).toBe(zeroAddress);
      });

      it(`getNominalICR: with zeroAddress (${protocolConfig.CHAIN.name})`, async () => {
        const result = await getNominalICR(
          {
            publicClient,
            protocolConfig,
            troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
          },
          zeroAddress
        );

        expect(result.toString()).toBe(maxUint256.toString());
      });
    }
  }
});
