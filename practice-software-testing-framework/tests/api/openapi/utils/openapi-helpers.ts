import { APIRequestContext, APIResponse } from '@playwright/test';
import apiDocumentation from '../../apiDocumentation.json/apiDocumentation.json';

type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type PrimitiveParam = string | number | boolean;

type OpenApiParameter = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required?: boolean;
  example?: unknown;
  schema?: Record<string, unknown>;
};

type OpenApiOperation = {
  operationId?: string;
  tags?: string[];
  parameters?: OpenApiParameter[];
  requestBody?: {
    required?: boolean;
    content?: Record<string, { schema?: Record<string, unknown> }>;
  };
  responses: Record<string, unknown>;
};

type OpenApiDocument = {
  paths: Record<string, Partial<Record<HttpMethod, OpenApiOperation>>>;
  components?: {
    schemas?: Record<string, Record<string, unknown>>;
  };
};

export type EndpointOperation = {
  path: string;
  method: HttpMethod;
  operation: OpenApiOperation;
};

const doc = apiDocumentation as unknown as OpenApiDocument;

export const LEGACY_COVERED_OPERATIONS = new Set<string>([
  'get /products',
  'get /products/{productId}',
  'get /products/{id}',
  'get /brands',
  'get /categories',
  'post /payment/check',
]);

export const COMMON_NEGATIVE_STATUS_CODES = [400, 401, 403, 404, 405, 409, 415, 422, 423, 429, 500];

export function operationKey(method: HttpMethod, path: string): string {
  return `${method} ${path}`;
}

export function getAllOperations(): EndpointOperation[] {
  const result: EndpointOperation[] = [];
  const methods: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete'];

  for (const [path, methodMap] of Object.entries(doc.paths)) {
    for (const method of methods) {
      const operation = methodMap[method];
      if (operation) {
        result.push({ path, method, operation });
      }
    }
  }

  return result;
}

function resolveSchema(schema: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!schema) {
    return undefined;
  }

  const ref = schema.$ref;
  if (typeof ref !== 'string') {
    return schema;
  }

  const prefix = '#/components/schemas/';
  if (!ref.startsWith(prefix)) {
    return schema;
  }

  const schemaName = ref.slice(prefix.length);
  return doc.components?.schemas?.[schemaName] ?? schema;
}

function buildPrimitiveFromSchema(schema: Record<string, unknown> | undefined): unknown {
  const resolved = resolveSchema(schema);
  if (!resolved) {
    return 'sample';
  }

  if (resolved.example !== undefined) {
    return resolved.example;
  }

  const type = resolved.type;
  const format = resolved.format;

  if (type === 'string') {
    if (format === 'email') {
      return `api.${Date.now()}@example.test`;
    }

    if (format === 'date') {
      return '1990-01-01';
    }

    if (format === 'password') {
      return 'Aa@123456';
    }

    return 'sample-text';
  }

  if (type === 'integer' || type === 'number') {
    return 1;
  }

  if (type === 'boolean') {
    return true;
  }

  if (type === 'array') {
    const items = resolved.items as Record<string, unknown> | undefined;
    return [buildPrimitiveFromSchema(items)];
  }

  if (type === 'object' || resolved.properties) {
    return buildBodyFromSchema(resolved);
  }

  return 'sample-text';
}

function buildBodyFromSchema(schema: Record<string, unknown> | undefined): Record<string, unknown> {
  const resolved = resolveSchema(schema);
  if (!resolved) {
    return {};
  }

  const properties = (resolved.properties as Record<string, Record<string, unknown>> | undefined) ?? {};
  const required = ((resolved.required as string[] | undefined) ?? []).filter((name) => properties[name]);
  const keys = required.length > 0 ? required : Object.keys(properties);

  const output: Record<string, unknown> = {};
  for (const key of keys) {
    output[key] = buildPrimitiveFromSchema(properties[key]);
  }

  return output;
}

function pathValue(parameter: OpenApiParameter, method: HttpMethod): string {
  if (parameter.example !== undefined) {
    if (typeof parameter.example === 'string' || typeof parameter.example === 'number' || typeof parameter.example === 'boolean') {
      return String(parameter.example);
    }

    return JSON.stringify(parameter.example);
  }

  if (method === 'delete' || method === 'put' || method === 'patch') {
    return 'non-existent-id';
  }

  if (parameter.name.toLowerCase().includes('invoice_number')) {
    return 'INV-NOT-FOUND';
  }

  return '1';
}

function queryValue(parameter: OpenApiParameter): PrimitiveParam {
  if (parameter.example !== undefined) {
    if (typeof parameter.example === 'string' || typeof parameter.example === 'number' || typeof parameter.example === 'boolean') {
      return parameter.example;
    }

    return JSON.stringify(parameter.example);
  }

  const type = parameter.schema?.type;
  if (type === 'integer' || type === 'number') {
    return 1;
  }

  if (type === 'boolean') {
    return true;
  }

  return 'sample';
}

function buildUrl(pathTemplate: string, operation: OpenApiOperation, method: HttpMethod): { url: string; params: Record<string, PrimitiveParam> } {
  let url = pathTemplate;
  const params: Record<string, PrimitiveParam> = {};

  const parameters = operation.parameters ?? [];

  for (const parameter of parameters) {
    if (parameter.in === 'path') {
      url = url.replace(`{${parameter.name}}`, encodeURIComponent(pathValue(parameter, method)));
      continue;
    }

    if (parameter.in === 'query' && parameter.required) {
      params[parameter.name] = queryValue(parameter);
    }
  }

  return { url, params };
}

function buildBody(operation: OpenApiOperation): { data?: unknown; multipart?: Record<string, string> } {
  const content = operation.requestBody?.content ?? {};

  const json = content['application/json'];
  if (json?.schema) {
    return { data: buildBodyFromSchema(json.schema) };
  }

  if (content['multipart/form-data']) {
    return { multipart: {} };
  }

  if (content['application/x-www-form-urlencoded']) {
    return { data: {} };
  }

  return {};
}

export async function invokeOperation(request: APIRequestContext, endpoint: EndpointOperation): Promise<APIResponse> {
  const { url, params } = buildUrl(endpoint.path, endpoint.operation, endpoint.method);
  const body = buildBody(endpoint.operation);

  const options: {
    params?: Record<string, PrimitiveParam>;
    data?: unknown;
    multipart?: Record<string, string>;
    failOnStatusCode: false;
  } = {
    failOnStatusCode: false,
  };

  if (Object.keys(params).length > 0) {
    options.params = params;
  }

  if (body.data !== undefined) {
    options.data = body.data;
  }

  if (body.multipart) {
    options.multipart = body.multipart;
  }

  switch (endpoint.method) {
    case 'get':
      return request.get(url, options);
    case 'post':
      return request.post(url, options);
    case 'put':
      return request.put(url, options);
    case 'patch':
      return request.patch(url, options);
    case 'delete':
      return request.delete(url, options);
    default:
      throw new Error(`Unsupported method: ${endpoint.method}`);
  }
}

export function expectedStatusCodes(operation: OpenApiOperation): number[] {
  return [...new Set(Object.keys(operation.responses)
    .map((code) => Number.parseInt(code, 10))
    .filter((code) => Number.isFinite(code)))];
}
