// packages
import * as fs from "fs";
import * as yaml from "js-yaml";

// types
import { Config } from "./types/Config";

// generators
import { SchemaGenerator } from "./generators/SchemaGenerator";
import { ProxyGenerator } from "./generators/ProxyGenerator";
import { ResourceGenerator } from "./generators/ResourceGenerator";
import { DataSourceGenerator } from "./generators/DataSourceGenerator"; 
import { UtilsGenerator } from "./generators/UtilsGenerator";

// Read config file
const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
const config: Config = yaml.load(yamlFileContent) as Config;

// Create output folders
createFolderIfNotExists("output");
createFolderIfNotExists(`output/${config.package}`);

// Generate schema file
// const schemaGenerator = new SchemaGenerator();
// schemaGenerator.generate();

// Generate proxy file
// const proxyGenerator = new ProxyGenerator();
// proxyGenerator.generate();

// Generate resource file
const resourceGenerator = new ResourceGenerator();
resourceGenerator.generate();

// Generate data source file
// const dataSourceGenerator = new DataSourceGenerator();
// dataSourceGenerator.generate();

// Generate test files

// Generate docs

function createFolderIfNotExists(folderPath: string) {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  } catch (err) {
    console.error(err);
  }
}
