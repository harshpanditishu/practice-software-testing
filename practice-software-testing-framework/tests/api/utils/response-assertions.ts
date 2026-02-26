import { expect, APIResponse } from '@playwright/test';

export async function expectJsonResponse(response: APIResponse): Promise<unknown> {
  expect(response.ok(), `Expected success status, got ${response.status()}`).toBeTruthy();
  const contentType = response.headers()['content-type'] ?? '';
  expect(contentType.toLowerCase()).toContain('application/json');
  return response.json();
}

export function expectArray(value: unknown): asserts value is unknown[] {
  expect(Array.isArray(value)).toBeTruthy();
}

export function expectObjectWithKeys(value: unknown, keys: string[]): void {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  for (const key of keys) {
    expect((value as Record<string, unknown>)[key]).toBeDefined();
  }
}
