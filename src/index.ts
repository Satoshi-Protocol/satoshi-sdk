import 'module-alias/register';

export * from './network';
export * from './types';
export * from './config';
export * from './abi';
export * from './core';

export const Hello = (name: string): string => {
  return `Hello ${name}`;
};
