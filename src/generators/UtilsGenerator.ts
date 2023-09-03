import { SwaggerSchema, SwaggerSchemaProperty } from "../types/Swagger";
import templates from "../utils/templates";
import {
  camelToPascal,
  camelToSnake,
  goSdkName,
  pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";

interface NestedData {
  objectPascal: string;
  objectCamel: string;
  objectGoSdk: string;
}

interface NestedObjectPropertyData {
  objectName: string;
  property: string;
  objectProperty: string;
  nestedObjectFunc?: string;
  type?: string;
}

export class UtilsGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = templates.get("utils")!;
    this.outputLocation = this.getOutputLocation("utils");
  }

  // generate utils file
  public generate() {
    const utilsData = {
      resourceDataFunc: this.generateResourceDataFunc(),
      nestedObjects: this.handleNestedObjects(),
    };

    this.generateFile(this.template, this.outputLocation, utilsData);
  }

  private generateResourceDataFunc(): string {
    const resourceDataFuncData = {
      pascalName: Generator.globalData.pascalName,
      mainObjectGoSDK: Generator.globalData.mainObjectGoSDK,
      basicProperties: this.generateBasicProperties(),
      complexProperties: this.generateComplexProperties(),
    };
    return this.generateTemplateStr(templates.get("createResourceData")!, resourceDataFuncData);
  }

  private generateBasicProperties(): object[] {
    const basicProperties: object[] = [];

    for (const [name, property] of Object.entries(
      Generator.swagger.definitions[Generator.config.mainObject].properties!
    )) {
      if (this.evaluatePropertyType(name, property) === "basic type") {
        basicProperties.push({
          propertyCamel: name,
          propertySnake: camelToSnake(name),
          propertyPascal: camelToPascal(name),
          type: property.type,
        });
      }
    }
    return basicProperties;
  }

  private generateComplexProperties(): string[] {
    const complexProperties: string[] = [];

    for (const [name, property] of Object.entries(
      Generator.swagger.definitions[Generator.config.mainObject].properties!
    )) {
      if (this.evaluatePropertyType(name, property) === "nested object") {
        complexProperties.push(
          `build${camelToPascal(name)}(d.Get("${camelToSnake(name)}").(interface{}))`
        );
      }
      if (
        this.evaluatePropertyType(name, property) === "nested objects array"
      ) {
        complexProperties.push(
          `build${camelToPascal(name)}s(d.Get("${camelToSnake(
            name
          )}").([]interface{}))`
        );
      }
    }

    return complexProperties;
  }

  // creates a build and flatten function for each nested object
  private handleNestedObjects(): string[] {
    const nestedObjectFunctions: string[] = [];

    for (const nestedObjectName of Generator.nestedObjects) {
      console.info(`Creating util functions for ${nestedObjectName}`);
      const nestedObject = Generator.swagger.definitions[nestedObjectName];
      if (!nestedObject) {
        throw new Error(
          `The nested object ${nestedObjectName} does not exist in the swagger file`
        );
      }

      const nestedObjectData = {
        objectPascal: nestedObjectName,
        objectCamel: pascalToCamel(nestedObjectName),
        objectGoSdk: goSdkName(nestedObjectName),
      };

      console.info(`Creating build function for ${nestedObjectName}`);
      nestedObjectFunctions.push(
        this.generateBuildFunction(nestedObject, nestedObjectData)
      );

      console.info(`Creating flatten function for ${nestedObjectName}`);
      nestedObjectFunctions.push(
        this.generateFlattenFunction(nestedObject, nestedObjectData)
      );
      console.log(`Created util functions for ${nestedObjectName}`);
    }

    return nestedObjectFunctions;
  }

  // generates a build function for a nested object
  private generateBuildFunction(
    nestedObject: SwaggerSchema,
    objectData: NestedData
  ): string {
    const buildProperties: string[] = [];

    function generateBuildProperty(
      name: string,
      property: SwaggerSchemaProperty
    ): string {
      const buildPropertyData: NestedObjectPropertyData = {
        objectName: objectData.objectPascal,
        property: camelToSnake(name),
        objectProperty: camelToPascal(name),
      };

      switch (this.evaluatePropertyType(name, property)) {
        case "basic type":
          buildPropertyData.type = property.type!;
          break;
        case "nested object":
          if (property.items?.$ref) {
            buildPropertyData.type = "nested object";
            buildPropertyData.nestedObjectFunc = `build${
              property.items.$ref.split("/")[2]
            }`;
          }
          break;
        case "string array":
          break;
        case "nested objects array":
          if (property.items?.$ref) {
            buildPropertyData.type = "nested objects array";
            buildPropertyData.nestedObjectFunc = `build${
              property.items.$ref.split("/")[2]
            }s`;
          }
          break;
      }
      return this.generateTemplateStr(
        templates.get("buildProperty")!,
        buildPropertyData
      );
    }

    if (nestedObject.properties) {
      for (const [name, property] of Object.entries(nestedObject.properties)) {
        buildProperties.push(generateBuildProperty(name, property));
      }
    }
    return this.generateTemplateStr(templates.get("buildFunction")!, {
      ...objectData,
      buildProperties: buildProperties,
    });
  }

  // generates a flatten function for a nested object
  private generateFlattenFunction(
    nestedObject: SwaggerSchema,
    objectData: NestedData
  ): string {
    const flattenProperties: string[] = [];

    // generates a flatten statement for a property
    function generateFlattenProperty(
      name: string,
      property: SwaggerSchemaProperty
    ): string {
      const flattenPropertyData: NestedObjectPropertyData = {
        objectName: objectData.objectPascal,
        property: camelToSnake(name),
        objectProperty: camelToPascal(name),
      };

      switch (this.evaluatePropertyType(name, property)) {
        case "basic type":
          break;
        case "nested object":
          if (property.items?.$ref) {
            const nestedObjectName = property.items.$ref.split("/")[2];
            flattenPropertyData.nestedObjectFunc = `flatten${nestedObjectName}`;
          }
          break;
        case "string array":
          break;
        case "nested objects array":
          if (property.items?.$ref) {
            const nestedObjectName = property.items.$ref.split("/")[2];
            flattenPropertyData.nestedObjectFunc = `flatten${nestedObjectName}s`;
          }
          break;
        default:
          throw new Error(`Unable to handle property ${name}: ${property}`)
      }
      
      return this.generateTemplateStr(
        templates.get("flattenProperty")!,
        flattenPropertyData
      );
    }

    if (nestedObject.properties) {
      for (const [name, property] of Object.entries(nestedObject.properties)) {
        flattenProperties.push(generateFlattenProperty(name, property));
      }
    }

    return this.generateTemplateStr(templates.get("flattenFunction")!, {
      ...objectData,
      flattenProperties: flattenProperties,
    });
  }
}
