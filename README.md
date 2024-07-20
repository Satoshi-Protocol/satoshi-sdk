![Banner](https://i.imgur.com/X26YuSj.png)

Satoshi Protocol SDK, a comprehensive toolkit for developers to integrate and interact with the Satoshi Protocol, a DeFi platform on the blockchain.

[![npm version](https://img.shields.io/npm/v/your-package.svg?color=%23DFE2E4)](https://www.npmjs.com/package/satoshi-sdk)
[![license](https://img.shields.io/github/license/your-username/your-repository.svg?color=%23DFE2E4)](https://github.com/your-username/your-repository/blob/main/LICENSE)
[![downloads](https://img.shields.io/npm/dm/your-package.svg?color=%23DFE2E4)](https://www.npmjs.com/package/satoshi-sdk)

## Documentation

For documentation and guides, visit [docs.satoshiprotocol.org/sdk](https://docs.satoshiprotocol.org/sdk/introduction).

## Community

For help, discussion about best practices, or any other conversation that would benefit from being searchable:
- [Discuss on GitHub](https://github.com/Satoshi-Protocol/satoshi-sdk/issues)
- [Join the Discord](https://discord.gg/CakRgSnPVS)


## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (version 18 or higher)
- npm, yarn, or pnpm
- Git (for cloning the repository)

## Installation

Install the SDK using npm:

```bash
npm install --save satoshi-sdk
```

### Example: Open trove
```typescript
import { parseUnits, parseEther, defineChain, } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { SatoshiClient, getWalletClientByConfig, ProtocolConfigMap, DEBT_TOKEN_DECIMALS, wbtcABI, waitTxReceipt } from 'satoshi-sdk';

main()
async function main() {
  // Use BEVM Chain
  const protocolConfig = ProtocolConfigMap.BEVM_MAINNET;
  const account = privateKeyToAccount(process.env.PRIV as `0x${string}`);
  const walletClient = getWalletClientByConfig(protocolConfig, account);

  const satoshiClient = new SatoshiClient(protocolConfig, walletClient);
  const publicClient = satoshiClient.publicClient;
  
  // Step 1: Parse the borrowing amount and collateral amount
  const borrowingAmt = parseUnits('10', DEBT_TOKEN_DECIMALS); // Converts the string '10' into a BigNumber using the specified number of decimals
  const totalCollAmt = parseEther('0.1'); // Converts the Ether string '0.1' to its Wei equivalent as a BigNumber
  
  // Step 2: convert BEVM BTC to WBTC
  const collateral = protocolConfig.COLLATERALS[0];
  const depositHash = await walletClient.writeContract({
    chain: protocolConfig.CHAIN,
    account: walletClient.account,
    address: collateral.ADDRESS,
    abi: wbtcABI,
    functionName: 'deposit',
    args: [],
    value: totalCollAmt,
  });
  const wbtcReceipt = await waitTxReceipt({ publicClient, }, depositHash); // Wait for the transaction to be confirmed
  console.log({
    wbtcReceipt,
  })
  
  // Step 3: Open a trove
  const openTroveReceipt = await satoshiClient.TroveManager.doOpenTrove({
    collateral,
    borrowingAmt,
    totalCollAmt,
  });
  
  console.log({
    openTroveReceipt
  })
}

```