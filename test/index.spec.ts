import { Hello, ProtocolConfigMap, getPublicClientByConfig } from '../src';

describe('index', () => {
  describe('client', () => {
    it('getBlockNumber', async () => {
      const allConfig = Object.values(ProtocolConfigMap);
      for (const config of allConfig) {
        const publicClient = getPublicClientByConfig(config);
        const blockNumber = await publicClient.getBlockNumber();
        expect(blockNumber).toBeGreaterThan(0);
      }
    });
  });

  describe('Hello', () => {
    [
      {
        input: 'Satoshi Nakamoto',
        expectResult: 'Hello Satoshi Nakamoto',
      },
      {
        input: 'Satoshi Protocol',
        expectResult: 'Hello Satoshi Protocol',
      },
    ].forEach(({ input, expectResult }) => {
      it(`should return ${expectResult}`, () => {
        const result = Hello(input);
        expect(result).toMatch(expectResult);
      });
    });
  });
});
