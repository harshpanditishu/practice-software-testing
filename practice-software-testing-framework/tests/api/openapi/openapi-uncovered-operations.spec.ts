import { test, expect } from '@playwright/test';
import {
  getAllOperations,
  invokeOperation,
  expectedStatusCodes,
  COMMON_NEGATIVE_STATUS_CODES,
  LEGACY_COVERED_OPERATIONS,
  operationKey,
} from './utils/openapi-helpers';

const operations = getAllOperations();
const uncoveredOperations = operations.filter(
  ({ method, path }) => !LEGACY_COVERED_OPERATIONS.has(operationKey(method, path)),
);

test.describe('OpenAPI uncovered operations contract', () => {
  test('OpenAPI operation inventory is loaded @smoke', async () => {
    expect(operations.length).toBeGreaterThan(50);
    expect(uncoveredOperations.length).toBeGreaterThan(0);
  });

  for (const endpoint of uncoveredOperations) {
    const operationId = endpoint.operation.operationId ?? `${endpoint.method}-${endpoint.path}`;

    test(`[contract] ${endpoint.method.toUpperCase()} ${endpoint.path} (${operationId}) returns documented or supported negative status @regression`, async ({ request }) => {
      const response = await invokeOperation(request, endpoint);

      const allowedStatuses = new Set<number>([
        ...expectedStatusCodes(endpoint.operation),
        ...COMMON_NEGATIVE_STATUS_CODES,
      ]);

      const status = response.status();
      expect(allowedStatuses.has(status)).toBeTruthy();

      const contentType = response.headers()['content-type'] ?? '';
      if (contentType.toLowerCase().includes('application/json')) {
        const body = await response.json();
        expect(body).toBeDefined();
      }
    });
  }
});
