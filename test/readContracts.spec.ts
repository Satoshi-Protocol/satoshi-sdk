/* eslint-disable @typescript-eslint/require-await */
import { maxUint256, zeroAddress } from 'viem';

import {
  ProtocolConfigMap,
  RANDOM_SEED,
  TRIAL_NUMBER,
  getApproxHint,
  getBorrowingFee,
  getEntireDebtAndColl,
  getInsertPosition,
  getIsApprovedDelegate,
  getNominalICR,
  getNumTroves,
  getTroves
} from '../src';
import { bevmPublicClient, bitlayerPublicClient } from './mock';

jest.setTimeout(5000);

describe('BEVM readContracts', () => {
  const protocolConfig = ProtocolConfigMap.BEVM_MAINNET;  
  const publicClient = bevmPublicClient;
  const collaterals = protocolConfig.COLLATERALS;

  it(`getEntireDebtAndColl (${protocolConfig.CHAIN.name})`, async () => {
    const result = await getEntireDebtAndColl(
      {
        publicClient,
        protocolConfig,
        troveManagerAddr: collaterals[0].TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      },
      zeroAddress
    );

    expect(result.debt).toBeDefined();
    expect(result.coll).toBeDefined();
    expect(result.pendingDebtReward).toBeDefined();
    expect(result.pendingCollateralReward).toBeDefined();
  });

  it(`getIsApprovedDelegate (${protocolConfig.CHAIN.name})`, async () => {
    const result = await getIsApprovedDelegate(
      {
        publicClient,
        protocolConfig
      },
      zeroAddress
    );

    expect(result).toBeDefined();
  });

  for (const collateral of collaterals) {
    describe(`Collateral: ${collateral.NAME}`, () => {
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

      // TODO: debug this test, always timeout
      // it(`getInsertPosition: with zero nicr (${protocolConfig.CHAIN.name})`, async () => {
      //   const result = await getInsertPosition(
      //     {
      //       publicClient,
      //       protocolConfig,
      //       sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
      //     },
      //     0n,
      //     zeroAddress,
      //     zeroAddress
      //   );

      //   expect(result.upperHint.length).toBe(zeroAddress.length);
      //   expect(result.lowerHint).toBe(zeroAddress);
      // });

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

      it(`getTroves (${protocolConfig.CHAIN.name}) should not be defined`, async () => {
        const result = await getTroves(
          {
            publicClient,
            protocolConfig,
            troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
          },
          zeroAddress
        );

        expect(result).toBeDefined();
        expect(result.debt).toBeDefined();
        expect(result.coll).toBeDefined();
        expect(result.stake).toBeDefined();
        expect(result.status).toBeDefined();
        expect(result.arrayIndex).toBeDefined();
        expect(result.activeInterestIndex).toBeDefined();
      });

      it(`getNumTroves (${protocolConfig.CHAIN.name})`, async () => {
        const result = await getNumTroves(
          {
            publicClient,
            protocolConfig,
            sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
          }
        );

        expect(result > 0n).toBeTruthy();
      });
    });
  }
  
});


describe('Bitlayer readContracts', () => {
  const protocolConfig = ProtocolConfigMap.BITLAYER_MAINNET;  
  const publicClient = bitlayerPublicClient;

  it(`getEntireDebtAndColl (${protocolConfig.CHAIN.name})`, async () => {
    const result = await getEntireDebtAndColl(
      {
        publicClient,
        protocolConfig,
        troveManagerAddr: collaterals[0].TROVE_MANAGER_BEACON_PROXY_ADDRESS,
      },
      zeroAddress
    );

    expect(result.debt).toBeDefined();
    expect(result.coll).toBeDefined();
    expect(result.pendingDebtReward).toBeDefined();
    expect(result.pendingCollateralReward).toBeDefined();
  });

  it(`getIsApprovedDelegate (${protocolConfig.CHAIN.name})`, async () => {
    const result = await getIsApprovedDelegate(
      {
        publicClient,
        protocolConfig
      },
      zeroAddress
    );

    expect(result).toBeDefined();
  });

  const collaterals = protocolConfig.COLLATERALS;
  for (const collateral of collaterals) {
    describe(`Collateral: ${collateral.NAME}`, () => {
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
    });

    it(`getTroves (${protocolConfig.CHAIN.name}) should not be defined`, async () => {
      const result = await getTroves(
        {
          publicClient,
          protocolConfig,
          troveManagerAddr: collateral.TROVE_MANAGER_BEACON_PROXY_ADDRESS,
        },
        zeroAddress
      );

      expect(result).toBeDefined();
      expect(result.debt).toBeDefined();
      expect(result.coll).toBeDefined();
      expect(result.stake).toBeDefined();
      expect(result.status).toBeDefined();
      expect(result.arrayIndex).toBeDefined();
      expect(result.activeInterestIndex).toBeDefined();
    });

    it(`getNumTroves (${protocolConfig.CHAIN.name})`, async () => {
      const result = await getNumTroves(
        {
          publicClient,
          protocolConfig,
          sortedTrovesAddr: collateral.SORTED_TROVE_BEACON_PROXY_ADDRESS,
        }
      );

      expect(result > 0n).toBeTruthy();
    });
  }
});
