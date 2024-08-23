import { PublicClient, WalletClient } from 'viem';

import { approveErc20, getErc20Allowance } from '../readContracts/erc20';
import { waitTxReceipt } from './helper';


export async function getErc20AllowanceAndApprove({
  walletClient,
  publicClient,
  tokenAddr,
  amount,
  owner,
  spender
}: {
  walletClient: WalletClient;
  publicClient: PublicClient;
  tokenAddr: `0x${string}`;
  amount: bigint;
  owner: `0x${string}`;
  spender: `0x${string}`;
}) {
  const assetAllowance = await getErc20Allowance(
    {
      publicClient,
      tokenAddr,
    },
    owner,
    spender
  );
  if (assetAllowance < amount) {
    const allowanceAmt = amount - assetAllowance;
    const approveCollHash = await approveErc20(
      {
        publicClient,
        walletClient,
        tokenAddr,
      },
      spender,
      allowanceAmt
    );
    await waitTxReceipt({ publicClient }, approveCollHash);
  }
  return;
};

export default getErc20AllowanceAndApprove