export interface Config {
  package: string;
  mainObject: string;
  operations: Operation[];
  ignoreProperties?: string[];
  testFiles?: boolean;
  documentation?: boolean;
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
