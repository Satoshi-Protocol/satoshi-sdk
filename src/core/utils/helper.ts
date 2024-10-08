import { PublicClient } from 'viem';

import { ValidationError } from '../..//types/utils.type';
import { ProtocolConfigMap } from '../../config';

export function getBoolean(str: string | undefined, defaultVal?: boolean) {
  try {
    if (str === '' || typeof str === 'undefined') throw new Error(`'${str}' is not a boolean`);
    return !!JSON.parse(str.toLowerCase());
  } catch (error) {
    if (typeof defaultVal !== 'undefined') {
      return defaultVal;
    }
    throw new Error(`'${str}' is not a boolean`);
  }
}

export function getNumber(
  str: string | undefined,
  { defaultVal = undefined } = {} as {
    defaultVal?: string | undefined;
  }
) {
  const val = str !== undefined && str !== '' ? str : defaultVal;
  if (val === '' || typeof val === 'undefined') throw new Error(`'${val}' is not a number`);
  const num = JSON.parse(val);
  if (typeof num === 'number') {
    return num;
  }
  throw new Error(`'${str}' is not a number`);
}

export function getString(
  str: string | undefined,
  {
    defaultVal = undefined,
    required = false,
  }: {
    defaultVal?: string | undefined;
    required?: boolean;
  } = {}
) {
  try {
    const val = str !== undefined && str !== '' ? str : defaultVal;
    if (required && (val === '' || typeof val === 'undefined')) throw new Error(`'${str}' is not a string`);
    return val as string;
  } catch (error) {
    throw new Error(`'${str}' is not a string`);
  }
}

export function getBigInt(str: string | undefined, { defaultVal = undefined } = {}) {
  try {
    const val = str !== undefined && str !== '' ? str : defaultVal;
    if (val === '' || typeof val === 'undefined') throw new Error(`'${str}' is not a bigint`);
    return BigInt(val);
  } catch (error) {
    throw new Error(`'${str}' is not a bigint`);
  }
}

export async function waitTxReceipt({ publicClient }: { publicClient: PublicClient }, txHash: `0x${string}`) {
  const receipt = await publicClient.waitForTransactionReceipt({
    hash: txHash,
  });
  return receipt;
}

export function getStringArray(str: string | undefined, defaultVal?: string[]) {
  try {
    if (str === '' || typeof str === 'undefined') {
      if (typeof defaultVal !== 'undefined') {
        return defaultVal;
      }
      throw new Error(`'${str}' is not a string`);
    }
    return str.split(',');
  } catch (error) {
    throw new Error(`'${str}' is not a string`);
  }
}

export function isSupportedChain(chainId: number) {
  const supportedChains = Object.values(ProtocolConfigMap).map(v => v.CHAIN.id);
  return supportedChains.includes(chainId);
}

export function validateOrThrow(condition: any, message: string): asserts condition {
  if (!condition) {
    throw new ValidationError(message);
  }
}
