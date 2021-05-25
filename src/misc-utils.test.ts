import { getStringRecordValue, isTruthyString, tabs } from './misc-utils';

describe('isTruthyString', () => {
  it('returns true for truthy strings', () => {
    expect(isTruthyString('foo')).toStrictEqual(true);
    expect(isTruthyString('a')).toStrictEqual(true);
    expect(isTruthyString('很高兴认识您！')).toStrictEqual(true);
  });

  it('returns false for falsy strings', () => {
    expect(isTruthyString('')).toStrictEqual(false);
  });

  it('returns false for non-strings', () => {
    expect(isTruthyString(true)).toStrictEqual(false);
    expect(isTruthyString(false)).toStrictEqual(false);
    expect(isTruthyString({ foo: 'bar' })).toStrictEqual(false);
    expect(isTruthyString([])).toStrictEqual(false);
    expect(isTruthyString(['baz'])).toStrictEqual(false);
  });
});

describe('tabs', () => {
  const TAB = '  ';

  it('throws on invalid inputs', () => {
    expect(() => tabs(0)).toThrow('Expected positive integer.');
    expect(() => tabs(-1)).toThrow('Expected positive integer.');
  });

  it('returns the specified number of tabs', () => {
    expect(tabs(1)).toStrictEqual(TAB);
    expect(tabs(5)).toStrictEqual(`${TAB}${TAB}${TAB}${TAB}${TAB}`);
  });

  it('prepends a prefix to the entire string', () => {
    expect(tabs(1, 'foo')).toStrictEqual(`foo${TAB}`);
    expect(tabs(5, 'foo')).toStrictEqual(`foo${TAB}${TAB}${TAB}${TAB}${TAB}`);
  });
});

describe('getStringRecordValue', () => {
  it('gets a string value', () => {
    expect(getStringRecordValue('foo', { foo: 'bar' })).toStrictEqual('bar');
  });

  it('returns the empty string for an undefined or null value', () => {
    expect(getStringRecordValue('foo', {})).toStrictEqual('');
    expect(getStringRecordValue('foo', { foo: undefined })).toStrictEqual('');
    expect(getStringRecordValue('foo', { foo: null } as any)).toStrictEqual('');
  });
});
