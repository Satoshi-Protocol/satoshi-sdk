import { Chain } from 'viem';

export enum ChainNameEnum {
  BEVM_MAINNET = 'BEVM_MAINNET',
  BITLAYER_MAINNET = 'BITLAYER_MAINNET',
  CORE_TESTNET = 'CORE_TESTNET',
  BOB_MAINNET = 'BOB_MAINNET',
  BOB_TESTNET = 'BOB_TESTNET',
  BIT_LAYER_TESTNET = 'BIT_LAYER_TESTNET',
  B2_TESTNET = 'B2_TESTNET',
}

export type Token = {
  symbol: string;
  address: `0x${string}`;
  decimals: number;
  // icon: StaticImageData;
};

export type CollateralConfig = {
  NAME: string;
  ADDRESS: `0x${string}`;
  DESCRIPTION: string;
  DECIMALS: number;
  TROVE_MANAGER_BEACON_PROXY_ADDRESS: `0x${string}`;
  SORTED_TROVE_BEACON_PROXY_ADDRESS: `0x${string}`;
  // ICON: StaticImageData;
  MIN_CR: number;
  ANNUAL_INTEREST_RATE: number;
  IS_NATIVE: boolean;
  DISPLAY_NAME: string;
  // DISPLAY_ICON: StaticImageData;
  PYTH_PRICE_ID?: string;
};

export type SatoshiABIConfig = {
  BORROWER_OPERATIONS: any;
  DEBT_TOKEN: any;
  MULTI_COLLATERAL_HINT_HELPERS: any;
  MULTI_TROVE_GETTER: any;
  OSHI_TOKEN: any;
  PRICE_FEED_AGGREGATOR: any;
  REWARD_MANAGER: any;
  SATOSHI_PERIPHERY: any;
  SORTED_TROVES: any;
  STABILITY_POOL: any;
  TROVE_MANAGER: any;
  NexusYieldManager: any;
};

export type ProtocolConfig = {
  CHAIN: Chain;
  // CHAIN_ID: number;
  // EXPLORE_HREF: string;
  // DEFAULT_RPC_URL: string;
  // RPC_URL_LIST?: string[];
  BOOTSTRAP_END_TIMESTAMP?: number;
  ABI: SatoshiABIConfig;
  CHAIN_NAME: ChainNameEnum;
  DEFAULT_GAS_LIMIT?: bigint;
  DEFAULT_MAX_FEE_PER_GAS?: bigint;
  DEFAULT_MAX_PRIORITY_FEE_PER_GAS?: bigint;
  BO_GAS_LIMIT?: bigint;
  BO_GAS_MULTIPLIER?: {
    numerator: bigint;
    denominator: bigint;
  };
  MIN_BORROWING_AMOUNT: number;
  GAS_COMPENSATION: number;
  MIN_NET_DEBT: number;
  STBTC_ADDRESS?: `0x${string}`;
  PROTOCOL_CONTRACT_ADDRESSES: {
    BORROWER_OPERATIONS_PROXY_ADDRESS: `0x${string}`;
    PRICE_FEED_AGGREGATOR_PROXY_ADDRESS: `0x${string}`;
    MULTI_COLLATERAL_HINT_HELPER_PROXY_ADDRESS: `0x${string}`;
    SATOSHI_PERIPHERY_ADDRESS: `0x${string}`;
    DEBT_TOKEN_ADDRESS: `0x${string}`;
    STABILITY_POOL_PROXY_ADDRESS: `0x${string}`;
    MULTI_TROVE_GETTER_ADDRESS: `0x${string}`;
    OSHI_TOKEN_ADDRESS: `0x${string}`;
    REWARD_MANAGER_ADDRESS: `0x${string}`;
    REFERRAL_MANAGER_ADDRESS?: `0x${string}`;
    NEXUS_YIELD_MANAGER_ADDRESS?: `0x${string}`;
  };
  COLLATERALS: CollateralConfig[];
  TOKEN_LIST: Token[];
  SWAP_TOKEN_LIST: Token[];
  IS_SWAP_ENABLED?: boolean;
  ORACLE_PYTH_ADDRESS?: `0x${string}`;
};
