import { Hello } from '../src';

describe('network', () => {
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
