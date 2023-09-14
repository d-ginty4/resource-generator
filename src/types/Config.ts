export interface Config {
  package: string;
  mainObject: string;
  operations: Operation[];
  ignoreProperties?: string[];
  testFiles?: boolean;
  documentation?: boolean;
}

export interface Operation {
  type: string;
  method: string;
  path: string;
  link?: string;
}
