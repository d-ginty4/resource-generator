// packages
import * as yaml from "js-yaml";
import * as fs from "fs";

// types
import { Config } from "../types/Config";
import {
  Definitions,
  Swagger,
  SwaggerSchema,
  SwaggerSchemaProperty,
} from "../types/Swagger";
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
  // protected properties
  protected static config: Config;
  protected static swagger: Swagger;
  protected static globalData: GlobalData;
  protected static nestedObjects: string[];
  protected static mainObject: SwaggerSchema;
  protected static skeltonStructure: boolean;

  // private properties
  private ignorableProperties: string[] = [];
  private basicTypes: string[];

  constructor() {
    Generator.config = this.setConfig();
    if (!Generator.config.operations) {
      console.info("No operations given, generating skeleton structure");
      Generator.skeltonStructure = true;
    } else if (Generator.config.operations.length !== 5) {
      throw new Error(
        "There must be 5 operations. Create, Read, Update, Delete and Get all"
      );
    }

    Generator.swagger = this.setSwagger();
    Generator.globalData = this.setGlobalData();
    Generator.nestedObjects = this.setNestedObjects();
    this.basicTypes = ["string", "integer", "boolean"];

    const properties: string[] = [
      "id",
      "dateCreated",
      "dateModified",
      "version",
      "createdBy",
      "selfUri",
    ];
    if (Generator.config.ignoreProperties) {
      this.ignorableProperties = [
        ...Generator.config.ignoreProperties,
        ...properties,
      ];
    } else {
      this.ignorableProperties = properties;
    }

    Generator.mainObject =
      Generator.swagger.definitions[Generator.config.mainObject];
    if (!Generator.mainObject) {
      throw new Error(
        `The main object ${Generator.config.mainObject} does not exist in the swagger file`
      );
    }
  }

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
    const that = this;

    function findObjects(obj: SwaggerSchema) {
      const properties = obj.properties;
      // Check if there's properties
      if (properties) {
        // Loop through every property
        for (const [propertyName, property] of Object.entries(properties)) {
          if (that.isIgnorableProperty(propertyName)) {
            continue;
          }
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
    return this.ignorableProperties.includes(propertyName);
  }

  protected isBasicType(type: string): boolean {
    return this.basicTypes.includes(type);
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
}
