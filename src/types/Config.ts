export interface Config {
  package: string;
  rootObject: string;
  operations: Operation[];
  testFiles?: boolean;
  documentation?: boolean;
}

export interface Operation {
  type: string;
  method: string;
  path: string;
  link?: string;
}
