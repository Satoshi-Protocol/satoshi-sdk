import { PublicClient } from 'viem';

export const getPythFeeAmount = async (
  {
    publicClient,
    // protocolConfig,
    pythOracleAddress,
  }: {
    publicClient: PublicClient;
    // protocolConfig: ProtocolConfig;
    pythOracleAddress: `0x${string}`;
  },
  priceUpdateData: `0x${string}`[]
) => {
  const feeAmount = await publicClient.readContract({
    address: pythOracleAddress,
    abi: [
      {
        inputs: [
          {
            internalType: 'bytes[]',
            name: 'updateData',
            type: 'bytes[]',
          },
        ],
        name: 'getUpdateFee',
        outputs: [
          {
            internalType: 'uint256',
            name: 'feeAmount',
            type: 'uint256',
          },
        ],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    functionName: 'getUpdateFee',
    args: [priceUpdateData],
  });

  return feeAmount;
};
