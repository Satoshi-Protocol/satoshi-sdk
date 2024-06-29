// eslint-disable-next-line prettier/prettier
import { type Address } from 'viem';

import { ChainNameEnum } from 'types';

export interface WalletInDto {
  address: string;
  id: string;
  name: string;
  agent?: string;
}

export interface TroveHintRequestDto {
  address: string;
  nicr: string;
  trove: `0x${string}`;
  chain: ChainNameEnum;
}

export interface GetReferMessage {
  address: string;
  referrer: string;
}

export interface GetReferrer {
  address: string;
}

export interface SetReferrer {
  address: Address;
  referrer: Address;
  message: string;
  signature: string;
}
