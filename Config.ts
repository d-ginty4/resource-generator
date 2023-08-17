export interface Config {
  package: string;
  rootObject: string;
  operations: Operation[];
  testFiles?: boolean;
  documentation?: boolean;
}

interface Operation {
  type: string;
  method: string;
  path: string;
  link?: string;
}
