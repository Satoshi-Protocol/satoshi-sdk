import axios from 'axios';
import { Address } from 'viem';

import { SATO_API_URL } from 'config';

import { SetReferrer, TroveHintRequestDto, WalletInDto } from './satoshi-api.type';

//
const axiosInstance = axios.create({
  baseURL: SATO_API_URL,
});

export const postWalletIn = async (dto: WalletInDto) => {
  const response = await axiosInstance.post('/wallet/in', dto);
  return response.data as boolean;
};

export const getTroveHint = async (dto: TroveHintRequestDto) => {
  const response = await axiosInstance.get('/trove/approx', {
    params: dto,
  });
  return response.data as {
    approx: string;
  };
};

export const getReferMessage = async (address: string, referrer: string) => {
  const response = await axiosInstance.get('/refer/message', {
    params: { address, referrer },
  });
  return response.data as {
    message: string;
    messageHash: string;
  };
};

export const getReferrer = async (address: string) => {
  const response = await axiosInstance.get('/refer/referrer', {
    params: { address },
  });
  return response.data as {
    address: Address;
    referrer: string;
  };
};

export const getTroveTask = async (address: string) => {
  const response = await axiosInstance.post('/trove/task', {
    address: address,
  });
  return response.data as {
    data: {
      result: boolean;
    };
  };
};

export const postSetReferrer = async (dto: SetReferrer) => {
  const response = await axiosInstance.post('/refer/set-referrer', dto);
  return response.data as {
    data: {
      address: Address;
      referrer: string;
    };
  };
};

export const getOatHolderList = async () => {
  const response = await axiosInstance.get('/oat/holders');
  return response.data as {
    oatHoldersStr: string;
    oatHolders: string[];
  };
};
