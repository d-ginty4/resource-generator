export interface Swagger {
  swagger: string;
  info: Info;
  host: string;
  tags: Tag[];
  schemes: string[];
  consumes: string[];
  produces: string[];
  paths: Paths;
  securityDefinitions: SecurityDefinitions;
  definitions: Definitions;
  responses: Responses;
  externalDocs: ExternalDocs;
}

export interface Info {
  description: string;
  version: string;
  title: string;
  termsOfService: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
  license: {
    name: string;
    url: string;
  };
}

export interface Tag {
  name: string;
  description: string;
  externalDocs: ExternalDocs;
}

export interface Paths {
  [path: string]: {
    [httpMethod: string]: SwaggerOperation;
  };  
}

export interface SwaggerOperation {
  tags: string[];
  summary?: string;
  description?: string;
  operationId: string;
  produces?: string[];
  parameters?: SwaggerParameter[];
  responses?: {
    [statusCode: string]: SwaggerResponse;
  };
  'x-inin-requires-permissions': {
    type: string
    permissions: string[]
  }
  'x-purecloud-method-name': string
}

export interface SwaggerParameter {
  name: string;
  in: string;
  description?: string;
  required?: boolean;
  type?: string;
  default: any
  format?: string;
}

export interface SwaggerResponse {
  description: string;
  schema?: {
    $ref: string
  };
}


export interface SecurityDefinitions {
  'PureCloud OAuth': {
    type: string;
    authorizationUrl: string;
    flow: string;
    scopes: {
      all: string;
    };
  };
  'Guest Chat JWT': {
    type: string;
    name: string;
    in: string;
  };
}

export interface Definitions {
  [definitionName: string]: SwaggerSchema;
}

export interface SwaggerSchema {
  type: string;
  properties?: {
    [propertyName: string]: SwaggerSchemaProperty;
  };
  required?: string[];
  items?: SwaggerSchema;
}

export interface SwaggerSchemaProperty {
  type: string;
  format?: string;
  description?: string;
  enum?: string[];
  items?: {
    $ref?: string;
    type?: string
  };
  $ref?: string;
}


export interface Responses {
    400: Resp
    401: Resp
    403: Resp
    404: Resp
    408: Resp
    413: Resp
    415: Resp
    429: Resp
    500: Resp
    503: Resp
    504: Resp
}

export interface Resp {
    description: string
    schema: {
        $ref: string
    }
}

export interface ExternalDocs {
  description: string;
  url: string;
}
