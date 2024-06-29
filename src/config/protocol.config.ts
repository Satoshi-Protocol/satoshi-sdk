import { parseUnits } from 'viem';

import { bevm_mainnet, bitlayer_mainnet } from './chain.config';
import { BEVM_ABI, BITLAYER_ABI } from '../abi';
import { ChainNameEnum, ProtocolConfig } from '../types/config.type';

const BEVM_MAINNET: ProtocolConfig = {
  CHAIN: bevm_mainnet,
  ABI: BEVM_ABI,
  API_QUERY_CHAIN: ChainNameEnum.BEVM_MAINNET,
  DEFAULT_GAS_LIMIT: BigInt(500000),
  DEFAULT_MAX_FEE_PER_GAS: parseUnits('0.05', 9), // 0.05 gwei
  DEFAULT_MAX_PRIORITY_FEE_PER_GAS: BigInt(0),
  BO_GAS_LIMIT: 1_300_000n,
  BO_GAS_MULTIPLIER: {
    numerator: 120n,
    denominator: 100n,
  },
  MIN_BORROWING_AMOUNT: 10, // 10 debt token
  GAS_COMPENSATION: 2, // 2 debt token
  MIN_NET_DEBT: 12, // 10 MIN_BORROWING_AMOUNT + 2 GAS_COMPENSATION
  STBTC_ADDRESS: '0x26bda683F874e7AE3e3A5d3fad44Bcb82a7c107C' as `0x${string}`,
  PROTOCOL_CONTRACT_ADDRESSES: {
    BORROWER_OPERATIONS_PROXY_ADDRESS: '0xaA1774e83127C741Fc7dA68550E6C17b3b2B5AcB' as `0x${string}`,
    PRICE_FEED_AGGREGATOR_PROXY_ADDRESS: '0x3dD4f09cef28842cE9958571F4Aab9dc605a2fF4' as `0x${string}`,
    MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS: '0x12b2Ce5ee42061c12fFaB288879CA68a3668Dc0d' as `0x${string}`,
    SATOSHI_PERIPHERY_ADDRESS: '0xfB6323FB3db8FCEF053a3dbaeA651b5d9e49457f' as `0x${string}`,
    DEBT_TOKEN_ADDRESS: '0xF2692468666E459D87052f68aE474E36C1a34fbB' as `0x${string}`,
    STABILITY_POOL_PROXY_ADDRESS: '0x5C85670c52AC0B135C84747B16B1d845007a2437' as `0x${string}`,
    MULTI_TROVE_GETTER_ADDRESS: '0x4a5381D7D7b92eB6134713657f3FA2De51976F51' as `0x${string}`,
    OSHI_TOKEN_ADDRESS: '0xf1067e81AdF2c2F9cAA8edbB75b6ccDfAD4dcBF1' as `0x${string}`,
    REWARD_MANAGER_ADDRESS: '0x023739ff540052927Fde6A4b7154Ce3fFc9382B8' as `0x${string}`,
    REFERRAL_MANAGER_ADDRESS: '0xD8519c1243038e55aC42b0785396dd8Dd6699F01' as `0x${string}`,
  },
  COLLATERALS: [
    {
      NAME: 'WBTC',
      DESCRIPTION: 'BEVM Bitcoin',
      ADDRESS: '0xB5136FEba197f5fF4B765E5b50c74db717796dcD' as `0x${string}`,
      DECIMALS: 18,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0x0598Ef47508Ec11a503670Ac3B642AAE8EAEdEFA' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0x563337073F6299e49b11A69d4Bd8d368c16D38F6' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: true,
      DISPLAY_NAME: 'BTC',
    },
    {
      NAME: 'wstBTC',
      DESCRIPTION: 'Bido Wrapped stBTC',
      ADDRESS: '0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820' as `0x${string}`,
      DECIMALS: 18,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0xa794a7Fd668FE378E095849caafA8C8dC7E84780' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0xE372f71b82b7BB43daad8E8aDb72Dfcf1CCbd268' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: false,
      DISPLAY_NAME: 'wstBTC',
    },
  ],
  TOKEN_LIST: [
    {
      symbol: 'WBTC',
      address: '0xB5136FEba197f5fF4B765E5b50c74db717796dcD' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'wstBTC',
      address: '0x2967E7Bb9DaA5711Ac332cAF874BD47ef99B3820' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'SAT',
      address: '0xF2692468666E459D87052f68aE474E36C1a34fbB' as `0x${string}`,
      decimals: 18,
    },
  ],
};

const BITLAYER_MAINNET: ProtocolConfig = {
  CHAIN: bitlayer_mainnet,
  API_QUERY_CHAIN: ChainNameEnum.BITLAYER_MAINNET,
  BOOTSTRAP_END_TIMESTAMP: 1718561110,
  ABI: BITLAYER_ABI,
  MIN_BORROWING_AMOUNT: 100, // 100 debt token
  GAS_COMPENSATION: 10, // 10 debt token
  MIN_NET_DEBT: 110, // 100 MIN_BORROWING_AMOUNT + 10 GAS_COMPENSATION
  PROTOCOL_CONTRACT_ADDRESSES: {
    BORROWER_OPERATIONS_PROXY_ADDRESS: '0xF0BE7E8923deF6c224d350b5aE53CB98d8bF485a' as `0x${string}`,
    PRICE_FEED_AGGREGATOR_PROXY_ADDRESS: '0xB7DeeFa4e0f8bEa85421f0acee38a33E8C2E00d5' as `0x${string}`,
    MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS: '0x96173C9319A1A52C94bC99C6401bDDC28BAc132c' as `0x${string}`,
    SATOSHI_PERIPHERY_ADDRESS: '0x95d4adBd1aD72B7c00565B241313c363EC68cA73' as `0x${string}`,
    DEBT_TOKEN_ADDRESS: '0xa1e63CB2CE698CfD3c2Ac6704813e3b870FEDADf' as `0x${string}`,
    STABILITY_POOL_PROXY_ADDRESS: '0xd9a9b39e972aC67259e39b22E536fCdfd5b8451c' as `0x${string}`,
    MULTI_TROVE_GETTER_ADDRESS: '0x07f69b1Ed174AF500B23becdEDc6Cbe7d47c4E73' as `0x${string}`,
    OSHI_TOKEN_ADDRESS: '0xF0225d5b6E5d3987499B52B3A95A3afB3D8D1263' as `0x${string}`,
    REWARD_MANAGER_ADDRESS: '0xfc8ab0e486F17c78Eaf59A416168d0F89D9373eD' as `0x${string}`,
  },
  COLLATERALS: [
    {
      NAME: 'WBTC',
      DESCRIPTION: 'Bitlayer Bitcoin',
      ADDRESS: '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f' as `0x${string}`,
      DECIMALS: 18,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0xf1A7b474440702BC32F622291B3A01B80247835E' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0x49B0050fFA9a3e1033c1c8d963665F3ad0716eE4' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: true,
      DISPLAY_NAME: 'BTC',
    },
    {
      NAME: 'stBTC',
      DESCRIPTION: 'Lorenzo stBTC',
      ADDRESS: '0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3' as `0x${string}`,
      DECIMALS: 18,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0xe9897fe6C8bf96D5ef8B0ECC7cBfEdef9818232c' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0x709795675EF595a4C2C4586517b71211Ac780915' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: false,
      DISPLAY_NAME: 'stBTC',
    },
  ],
  TOKEN_LIST: [
    {
      symbol: 'WBTC',
      address: '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'stBTC',
      address: '0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'SAT',
      address: '0xa1e63CB2CE698CfD3c2Ac6704813e3b870FEDADf' as `0x${string}`,
      decimals: 18,
    },
  ],
};

export const ProtocolConfigMap = {
  BEVM_MAINNET,
  BITLAYER_MAINNET,
};
