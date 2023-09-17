// packages
import * as yaml from "js-yaml";
import * as fs from "fs";

// types
import { Config } from "../types/Config";
import {
  Swagger,
  SwaggerSchema,
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
import { PropertyData } from "../PropertyData";
import { ObjectData } from "../ObjectData";

export abstract class Generator {
  // protected properties
  protected static config: Config;
  protected static swagger: Swagger;
  protected static globalData: GlobalData;
  protected static mainObject: SwaggerSchema;
  protected static skeltonStructure: boolean;
  protected static parentObject: ObjectData;

  // private properties
  private ignorableProperties: string[] = [];

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

    Generator.parentObject = this.setObject(Generator.mainObject);
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

  private setObject(object: SwaggerSchema): ObjectData {
    const required = object.required || [];
    const properties = object.properties;
    const tempObject = new ObjectData();

    if (properties) {
      for (const [propertyName, property] of Object.entries(properties)) {
        if (this.isIgnorableProperty(propertyName)) {
          continue;
        }
        const prop = new PropertyData();
        prop.setName(propertyName);
        property.type ? prop.setType(property.type) : prop.setType("object");
        property.description
          ? prop.setDescription(property.description)
          : prop.setDescription("");
        required.includes(propertyName)
          ? prop.setRequired(true)
          : prop.setRequired(false);

        if (prop.getType() === "array") {
          if (property.items?.type === "string") {
            prop.setIsStringArray(true);
            continue;
          }
          if (property.items?.$ref) {
            const objName = property.items?.$ref.split("/")[2]!;
            prop.setNestedObject({
              objectName: objName,
              objectData: this.setObject(
                Generator.swagger.definitions[objName]
              ),
            });
          }
        } else if (prop.getType() === "object") {
          const objName = property.$ref?.split("/")[2]!;

          prop.setNestedObject({
            objectName: objName,
            objectData: this.setObject(Generator.swagger.definitions[objName]),
          });
        }
        prop.generateData();
        
        tempObject.addProperty(prop);
      }
    }

    return tempObject;
  }

  // helpers
  protected isIgnorableProperty(propertyName: string): boolean {
    return this.ignorableProperties.includes(propertyName);
  }
}
