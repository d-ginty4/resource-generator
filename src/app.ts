// packages
import * as fs from "fs";
import * as yaml from "js-yaml";

// types
import { Config } from "./types/Config";

// generators
import SchemaGenerator from "./generators/SchemaGenerator";
import ProxyGenerator from "./generators/ProxyGenerator";
import ResourceGenerator from "./generators/ResourceGenerator";
import DataSourceGenerator from "./generators/DataSourceGenerator"; 
import { TestGenerator } from "./generators/TestGenerator";

// Read config file
const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
const config: Config = yaml.load(yamlFileContent) as Config;

// Create output folders
createFolderIfNotExists("output");
createFolderIfNotExists(`output/${config.package}`);

// Generate schema file
SchemaGenerator.generate();

// Generate proxy file
ProxyGenerator.generate();

// Generate resource file
ResourceGenerator.generate();

// Generate data source file
DataSourceGenerator.generate();

// Generate test files
const testGenerator = new TestGenerator(config.testFiles, config.initTest);
testGenerator.generate();

function createFolderIfNotExists(folderPath: string) {
  try {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  } catch (err) {
    console.error(err);
  }
}
