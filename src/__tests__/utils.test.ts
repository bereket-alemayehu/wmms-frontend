// src/__tests__/utils.test.ts
import { describe, test, expect } from 'vitest';
import { unwrapList, unwrapSingle, safeId } from '@/lib/api-unwrappers';

describe('API Unwrappers', () => {
  describe('unwrapList', () => {
    test('returns empty array for null/undefined', () => {
      expect(unwrapList(null)).toEqual([]);
      expect(unwrapList(undefined)).toEqual([]);
    });

    test('returns the array if payload is already an array', () => {
      const arr = [{ _id: '1' }, { _id: '2' }];
      expect(unwrapList(arr)).toEqual(arr);
    });

    test('unwraps data.documents pattern', () => {
      const payload = { data: { documents: [{ _id: '1' }] } };
      expect(unwrapList(payload)).toEqual([{ _id: '1' }]);
    });

    test('unwraps data.data pattern', () => {
      const payload = { data: { data: [{ _id: '1' }] } };
      expect(unwrapList(payload)).toEqual([{ _id: '1' }]);
    });

    test('unwraps top-level documents pattern', () => {
      const payload = { documents: [{ _id: '1' }] };
      expect(unwrapList(payload)).toEqual([{ _id: '1' }]);
    });

    test('returns empty array for unrecognized shape', () => {
      expect(unwrapList({ foo: 'bar' })).toEqual([]);
    });
  });

  describe('unwrapSingle', () => {
    test('throws for null payload', () => {
      expect(() => unwrapSingle(null)).toThrow('Empty response payload');
    });

    test('unwraps data.document pattern', () => {
      const payload = { data: { document: { _id: '1' } } };
      expect(unwrapSingle(payload)).toEqual({ _id: '1' });
    });

    test('unwraps data.ticket pattern', () => {
      const payload = { data: { ticket: { _id: 't1' } } };
      expect(unwrapSingle(payload)).toEqual({ _id: 't1' });
    });

    test('returns payload itself as fallback', () => {
      const payload = { _id: 'direct' };
      expect(unwrapSingle(payload)).toEqual({ _id: 'direct' });
    });
  });

  describe('safeId', () => {
    test('returns empty string for falsy values', () => {
      expect(safeId(null)).toBe('');
      expect(safeId(undefined)).toBe('');
      expect(safeId('')).toBe('');
    });

    test('returns string as-is', () => {
      expect(safeId('abc123')).toBe('abc123');
    });

    test('extracts _id from objects', () => {
      expect(safeId({ _id: 'obj123' })).toBe('obj123');
    });

    test('returns empty string for objects without _id', () => {
      expect(safeId({ name: 'no id' })).toBe('');
    });
  });
});
