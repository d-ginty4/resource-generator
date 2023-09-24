import * as yaml from "js-yaml";
import * as fs from "fs";
import { Config } from "../types/Config";

export default function readConfig(configFile?: string): Config {
  if (!configFile) {
    configFile = "config.yml";
  }
  const yamlFileContent = fs.readFileSync(configFile, "utf-8");

  const data: Config = yaml.load(yamlFileContent) as Config;

  // Validate the loaded data
  validateConfig(data);

  return data;
}

function validateConfig(data: any) {
  // Define a list of required properties in the Config type
  const requiredProperties: Array<keyof Config> = ["package", "mainObject"];

  // Check if all required properties are present
  for (const prop of requiredProperties) {
    if (!(prop in data)) {
      throw new Error(
        `Missing required property "${prop}" in the configuration file`
      );
    }
  }

  // Define a runtime representation of allowed properties based on the Config type
  const allowedProperties: Set<keyof Config> = new Set([
    "package",
    "mainObject",
    "operations",
    "ignoreProperties",
    "initTest",
    "testFiles",
    "documentation",
    "skeleton",
    "skeletonSchemaFile",
    "skeletonResourceFile",
    "skeletonProxyFile",
    "skeletonDataSourceFile",
    "noSchemaFile",
    "noResourceFile",
    "noProxyFile",
    "noDataSourceFile",
    "noUtilsFile",
  ]);

  // Check if all required properties are present
  for (const prop in data) {
    if (!allowedProperties.has(prop as keyof Config)) {
      throw new Error(`Unknown property "${prop}" in the configuration file`);
    }
  }
}
