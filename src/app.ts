// packages
import * as fs from "fs";
import * as path from "path";
import * as fsPromises from "fs/promises";
import yargs from "yargs";

// types
import { Config } from "./types/Config";

// generators
import SchemaGenerator from "./generators/SchemaGenerator";
import ProxyGenerator from "./generators/ProxyGenerator";
import ResourceGenerator from "./generators/ResourceGenerator";
import DataSourceGenerator from "./generators/DataSourceGenerator";
import { TestGenerator } from "./generators/TestGenerator";
import DocGenerator from "./generators/DocGenerator";
import readConfig from "./utils/readConfig";

async function main() {
  // Read config file
  const config: Config = readConfig();

  // Create output folders if they don't exist
  createFolderIfNotExists("output");
  createFolderIfNotExists(`output/${config.package}`);

  // delete all files in package folder
  await deleteFolderContent(`output/${config.package}`);

  if (!config.noSchema) {
    // Generate schema file
    SchemaGenerator.generate();
  }

  if (!config.noProxy) {
    // Generate proxy file
    ProxyGenerator.generate();
  }

  if (!config.noResource) {
    // Generate resource file
    ResourceGenerator.generate();
  }

  if (!config.noDataSource) {
    // Generate data source file
    DataSourceGenerator.generate();
  }

  // Generate test files
  const testGenerator = new TestGenerator(config.testFiles, config.initTest);
  testGenerator.generate();

  if (config.documentation) {
    createFolderIfNotExists(`output/${config.package}/examples`);
    createFolderIfNotExists(`output/${config.package}/examples/resources`);
    createFolderIfNotExists(`output/${config.package}/examples/data-sources`);

    // Generate documentation files
    DocGenerator.generate();
  }

  function createFolderIfNotExists(folderPath: string) {
    try {
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteFolderContent(folderPath: string) {
    try {
      const files = await fsPromises.readdir(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = await fsPromises.lstat(filePath);

        if (stat.isDirectory()) {
          // Recursively delete subfolder content
          await deleteFolderContent(filePath);
        } else {
          // Delete file
          await fsPromises.unlink(filePath);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }
}

// Call the main function
main().catch((error) => {
  console.error("An error occurred:", error);
});
