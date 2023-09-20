export interface Config {
  package: string;
  mainObject: string;
  operations: Operation[];
  ignoreProperties?: string[];
  initTest?: boolean;
  testFiles?: boolean;
  documentation?: boolean;
  skeleton?: boolean;
  skeletonSchemaFile?: boolean;
  skeletonResourceFile?: boolean;
  skeletonProxyFile?: boolean;
  skeletonDataSourceFile?: boolean;
}

export interface Operation {
  type: string;
  method: string;
  path: string;
  link?: string;
}
