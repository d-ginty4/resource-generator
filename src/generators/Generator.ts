// packages
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as handlebars from "handlebars";

// types
import { Config } from "../types/Config";
import { Definitions, Swagger, SwaggerSchema, SwaggerSchemaProperty } from "../types/Swagger";
import { GlobalData } from "../types/GlobalData";

// helper functions
import {
  goSdkName,
  pascalToCamel,
  snakeToCamel,
  snakeToEnglish,
  snakeToPascal,
} from "../utils/variableRenames";

export abstract class Generator {
  // abstract properties
  abstract template: string;
  abstract outputLocation: string;

  // protected properties
  protected static config: Config;
  protected static swagger: Swagger;
  protected static globalData: GlobalData;
  protected static nestedObjects: string[];
  protected static mainObject: SwaggerSchema;

  // private properties
  private static ignorableProperties: string[];
  private static basicTypes: string[];

  constructor() {
    // Avoid resetting data if it's already set
    if (!Generator.config) {
      Generator.config = this.setConfig();
    }
    if (!Generator.swagger) {
      Generator.swagger = this.setSwagger();
    }
    if (!Generator.globalData) {
      Generator.globalData = this.setGlobalData();
    }
    if (!Generator.nestedObjects) {
      Generator.nestedObjects = this.setNestedObjects();
    }
    if (!Generator.ignorableProperties) {
      Generator.ignorableProperties = [
        "id",
        "dateCreated",
        "dateModified",
        "version",
        "selfUri",
      ];
      handlebars.registerHelper("eq", function (a, b) {
        return a === b;
      });
    }
    if (!Generator.basicTypes) {
      Generator.basicTypes = ["string", "integer", "boolean"];
    }
    if (!Generator.mainObject) {
      Generator.mainObject =
        Generator.swagger.definitions[Generator.config.mainObject];

      if (!Generator.mainObject) {
        throw new Error(
          `The main object ${Generator.config.mainObject} does not exist in the swagger file`
        );
      }
    }
  }

  // setters
  private setConfig(): Config {
    const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
    const data: Config = yaml.load(yamlFileContent) as Config;
    return data;
  }

  private setSwagger(): Swagger {
    const jsonFileContent = fs.readFileSync("swagger.json", "utf-8");
    const jsonData: Swagger = JSON.parse(jsonFileContent) as Swagger;
    return jsonData;
  }

  private setGlobalData(): GlobalData {
    const resourceName = Generator.config.package;
    const data: GlobalData = {
      englishName: snakeToEnglish(resourceName),
      camelName: snakeToCamel(resourceName),
      pascalName: snakeToPascal(resourceName),
      snakeName: resourceName,
      mainObject: Generator.config.mainObject,
      mainObjectCamel: pascalToCamel(Generator.config.mainObject),
      mainObjectGoSDK: goSdkName(Generator.config.mainObject),
    };

    return data;
  }

  private setNestedObjects(): string[] {
    const definitions: Definitions = Generator.swagger.definitions;
    const objectNames: Set<string> = new Set(); // A set prevents duplicated objects being added

    function findObjects(obj: SwaggerSchema) {
      const properties = obj.properties;
      // Check if there's properties
      if (properties) {
        // Loop through every property
        for (const property of Object.values(properties)) {
          // Handle nested object
          if (property.$ref) {
            const objectName = property.$ref.split("/")[2];
            objectNames.add(objectName);
            findObjects(definitions[objectName]);
            return;
          }
          // Handle array of nested objects
          else if (
            property.type === "array" &&
            property.items?.type !== "string" &&
            property.items?.$ref
          ) {
            const objectName = property.items.$ref.split("/")[2];
            objectNames.add(objectName);
            findObjects(definitions[objectName]);
            return;
          }
        }
      }
    }

    // Start searching at the main object
    findObjects(definitions[Generator.config.mainObject]);
    return Array.from(objectNames);
  }

  // helpers
  protected isIgnorableProperty(propertyName: string): boolean {
    return Generator.ignorableProperties.includes(propertyName);
  }

  protected isBasicType(type: string): boolean {
    return Generator.basicTypes.includes(type);
  }

  protected hasNestedObject(): boolean {
    if (Generator.nestedObjects.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  // Evaluate the type of the property
  protected evaluatePropertyType(
    name: string,
    property: SwaggerSchemaProperty
  ): string {
    // Check if property is a basic type (string, integer, etc)
    if (this.isBasicType(property.type)) {
      return "basic type";
    }
    // Check if property is nested object
    else if (!property.items && property.$ref) {
      return "nested object";
    }
    // Check if property is an array
    else if (property.type === "array") {
      // check if array is an array of strings
      if (property.items?.type) {
        return "string array";
      }
      // check if array is an array of nested objects
      else if (property.items?.$ref) {
        return "nested object array";
      } else {
        throw new Error(`Unknown array property ${name}: ${property}`);
      }
    } else {
      throw new Error(`Unknown property ${name}: ${property}`);
    }
  }
  
  /**
   * Generate a file using a template and data
   * @param template file template location
   * @param destination the destination of the output file
   * @param data the data to be used by the template
   */
  protected generateFile(templateFile: string, destination: string, data?: object) {
    // check if the template file exists
    try {
      fs.accessSync(templateFile, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Template file ${templateFile} does not exist`);
    }
    // read the template file
    const templateText = fs.readFileSync(templateFile, "utf-8");

    // Compile the template
    const template = handlebars.compile(templateText);

    // combine the global data and the data passed in
    const allData = { ...Generator.globalData, ...data };

    // generate the file from the template and data
    const output = template(allData);

    // Save the generated output to a file
    fs.writeFileSync(destination, output, "utf-8");
  }

  /**
   * This function will generate a template and return the content as a string
   * @param template file template location
   * @param data the data to be used by the template
   */
  protected generateTemplateStr(templateLocation: string, data: object): string {
    // check if the template file exists
    try {
      fs.accessSync(templateLocation, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Template file ${templateLocation} does not exist`);
    }
    // read the template file
    const templateText = fs.readFileSync(templateLocation, "utf-8");

    // Compile the template
    const template = handlebars.compile(templateText);

    // generate the template
    const output = template(data);

    return output;
  }

  /**
   * Return the output location of a file type e.g. schema file
   * @param fileType file type e.g. schema
   */
  protected getOutputLocation(fileType: string): string {
    const packageName = Generator.config.package;
    switch (fileType) {
      case "schema":
        return `output/${packageName}/resource_genesyscloud_${packageName}_schema.go`;
      case "proxy":
        return `output/${packageName}/genesyscloud_${packageName}_proxy.go`;
      case "resource":
        return `output/${packageName}/resource_genesyscloud_${packageName}.go`;
      case "utils":
        return `output/${packageName}/resource_genesyscloud_${packageName}_utils.go`;
      case "dataSource":
        return `output/${packageName}/data_source_genesyscloud_${packageName}.go`;
      default:
        throw new Error(`Unknown file type ${fileType}`);
    }
  }
}
