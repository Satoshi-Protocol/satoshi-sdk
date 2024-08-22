import { parseUnits } from 'viem';

import { bevm_mainnet, bitlayer_mainnet, bob_mainnet } from './chain.config';
import { BEVM_ABI, BITLAYER_ABI } from '../abi';
import { ChainNameEnum, ProtocolConfig } from '../types/config.type';

export const SATO_API_URL = 'https://api.satoshiprotocol.org';

export const DEBT_TOKEN_DECIMALS = 18;
export const NICR_DECIMALS = 20;
export const IS_TROVE_HINT_FROM_API_ENABLED = true;
export const SP_APR_DAYS = 7;
export const PRICE_DECIMALS = 18;
export const BORROWING_FEE = 5; // 0.5%
export const BORROWING_FEE_BASE = 1000;
export const DEFAULT_MAX_FEE_PERCENTAGE = 0.05; // 5%
export const DEFAULT_MAX_REDEMPTION_FEE_PERCENTAGE = 0.05; // 5%
export const FEE_PERCENTAGE_DECIMALS = 18;
export const TRIAL_NUMBER = 15;
export const RANDOM_SEED = 42;
export const CR_DECIMALS = 18;
export const DECIMAL_PRECISION = 18;
export const MAX_ITERATIONS = 50;
export const OSHI_TOKEN_DECIMALS = 18;

const BEVM_MAINNET: ProtocolConfig = {
  CHAIN_NAME: ChainNameEnum.BEVM_MAINNET,
  CHAIN: bevm_mainnet,
  ABI: BEVM_ABI,
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
  SWAP_TOKEN_LIST: [],
};

const BITLAYER_MAINNET: ProtocolConfig = {
  CHAIN_NAME: ChainNameEnum.BITLAYER_MAINNET,
  CHAIN: bitlayer_mainnet,
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
  SWAP_TOKEN_LIST: [
    {
      symbol: 'USDT',
      address: '0xfe9f969faf8Ad72a83b761138bF25dE87eFF9DD2',
      decimals: 6,
    },
    {
      symbol: 'USDC',
      address: '0x9827431e8b77E87C9894BD50B055D6BE56bE0030',
      decimals: 6,
    },
  ],
};

const BOB_MAINNET: ProtocolConfig = {
  CHAIN_NAME: ChainNameEnum.BOB_MAINNET,
  CHAIN: bob_mainnet,
  BOOTSTRAP_END_TIMESTAMP: 1718561110,
  ABI: BITLAYER_ABI,
  MIN_BORROWING_AMOUNT: 100, // 100 debt token
  GAS_COMPENSATION: 10, // 10 debt token
  MIN_NET_DEBT: 110, // 100 MIN_BORROWING_AMOUNT + 10 GAS_COMPENSATION
  PROTOCOL_CONTRACT_ADDRESSES: {
    BORROWER_OPERATIONS_PROXY_ADDRESS: '0x5c1f44E8deD90B0efE155CbEe47f9D0Bcf0B17E8' as `0x${string}`,
    PRICE_FEED_AGGREGATOR_PROXY_ADDRESS: '0x665126290A2FE0E77277E07eaC59fd760662a1d6' as `0x${string}`,
    MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS: '0xE651B5A79059571c4ef63768bDf8b612F03F8d20' as `0x${string}`,
    SATOSHI_PERIPHERY_ADDRESS: '0x4a54D62d212BA989Fff63641C055efD9e57fAfd2' as `0x${string}`,
    DEBT_TOKEN_ADDRESS: '0x78Fea795cBFcC5fFD6Fb5B845a4f53d25C283bDB' as `0x${string}`,
    STABILITY_POOL_PROXY_ADDRESS: '0xCF444925ACE7653343cf3510fE99591395ae360B' as `0x${string}`,
    MULTI_TROVE_GETTER_ADDRESS: '0xf2E11B71c19B5CE97faa1646aE9058e513cfb50c' as `0x${string}`,
    OSHI_TOKEN_ADDRESS: '0xB18f1D0202f38BD4aA3c1A5Aa2fC8823aE4786b4' as `0x${string}`,
    REWARD_MANAGER_ADDRESS: '0x1E4DC3B9963365760e2048AD05eE6f11Dc287c0B' as `0x${string}`,
    NEXUS_YIELD_MANAGER_ADDRESS: '0x7253493c3259137431a120752e410b38d0c715C2' as `0x${string}`,
  },
  COLLATERALS: [
    {
      NAME: 'WETH',
      DESCRIPTION: 'Bob Wrapped Ether',
      ADDRESS: '0x4200000000000000000000000000000000000006' as `0x${string}`,
      DECIMALS: 18,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0xc50D117C21054455aE9602237d3d17ca5Fa91288' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0xa4FA738DEF9E3C5Ee3C90Ef39A405EDf682981E1' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: true,
      DISPLAY_NAME: 'ETH',
    },
    {
      NAME: 'WBTC',
      DESCRIPTION: 'Bob Wrapped BTC',
      ADDRESS: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3' as `0x${string}`,
      DECIMALS: 8,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0xBDFedF992128CbF10974DC935976116e10665Cc9' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0x1085C347F4E4ABd95C087cdB5b8ca5160f68C55c' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: false,
      DISPLAY_NAME: 'WBTC',
    },
    {
      NAME: 'tBTC',
      DESCRIPTION: 'Threshold tBTC',
      ADDRESS: '0xbba2ef945d523c4e2608c9e1214c2cc64d4fc2e2' as `0x${string}`,
      DECIMALS: 18,
      TROVE_MANAGER_BEACON_PROXY_ADDRESS: '0x8FAE9D3dBeE1c66b84E90df21A1DbdBab9262843' as `0x${string}`,
      SORTED_TROVE_BEACON_PROXY_ADDRESS: '0x126F323Db675939BB114A53D8FFb454860D55fd6' as `0x${string}`,
      MIN_CR: 1.1, // 110%
      ANNUAL_INTEREST_RATE: 0, // 0%
      IS_NATIVE: false,
      DISPLAY_NAME: 'tBTC',
    },
  ],
  TOKEN_LIST: [
    {
      symbol: 'WETH',
      address: '0x4200000000000000000000000000000000000006' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'WBTC',
      address: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3' as `0x${string}`,
      decimals: 8,
    },
    {
      symbol: 'tBTC',
      address: '0xbba2ef945d523c4e2608c9e1214c2cc64d4fc2e2' as `0x${string}`,
      decimals: 18,
    },
    {
      symbol: 'SAT',
      address: '0x78Fea795cBFcC5fFD6Fb5B845a4f53d25C283bDB' as `0x${string}`,
      decimals: 18,
    },
  ],
  SWAP_TOKEN_LIST: [
    {
      symbol: 'USDC',
      address: '0xe75D0fB2C24A55cA1e3F96781a2bCC7bdba058F0' as `0x${string}`,
      decimals: 6,
    },
    {
      symbol: 'USDT',
      address: '0x05D032ac25d322df992303dCa074EE7392C117b9' as `0x${string}`,
      decimals: 6,
    },
  ],
  IS_SWAP_ENABLED: true,
};

export const ProtocolConfigMap = {
  BEVM_MAINNET,
  BITLAYER_MAINNET,
  BOB_MAINNET,
};
