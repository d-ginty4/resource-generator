import { SwaggerSchema, SwaggerSchemaProperty } from "../types/Swagger";
import templates from "../utils/templates";
import {
  camelToPascal,
  camelToSnake,
  goSdkName,
  pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";

interface FlattenPropertyData {
  objectName: string;
  property: string;
  objectProperty: string;
  nestedObjectFunc?: string;
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
      //basicProperties: this.setProperties(Generator.config.mainObject),
      //complexProperties: this.complexProperties,
      nestedObjects: this.handleNestedObjects(),
    };

    this.generateFile(this.template, this.outputLocation, utilsData);
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
        this.generateBuildFunction(
          nestedObjectName,
          nestedObject,
          nestedObjectData
        )
      );

      console.info(`Creating flatten function for ${nestedObjectName}`);
      nestedObjectFunctions.push(
        this.generateFlattenFunction(
          nestedObjectName,
          nestedObject,
          nestedObjectData
        )
      );
      console.log(`Created util functions for ${nestedObjectName}`);
    }

    return nestedObjectFunctions;
  }

  // generates a build function for a nested object
  private generateBuildFunction(
    nestedObjectName: string,
    nestedObject: SwaggerSchema,
    objectData: object
  ): string {
    const buildFunctionTemplate = templates.get("buildFunction")!;
    const buildFunctionData = {};

    return this.generateTemplateStr(buildFunctionTemplate, {
      ...buildFunctionData,
      ...objectData,
    });
  }

  // generates a flatten function for a nested object
  private generateFlattenFunction(
    nestedObjectName: string,
    nestedObject: SwaggerSchema,
    objectData: object
  ): string {
    const flattenFunctionTemplate = templates.get("flattenFunction")!;
    const flattenProperties: string[] = [];
    const properties = nestedObject.properties;

    function generateFlattenProperty(
      name: string,
      property: SwaggerSchemaProperty
    ) {
      const flattenPropertyTemplate = templates.get("flattenProperty")!;

      const flattenPropertyData: FlattenPropertyData = {
        objectName: nestedObjectName,
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
          throw new Error(`Invalid property type for ${name}`);
      }
      return this.generateTemplateStr(
        flattenPropertyTemplate,
        flattenPropertyData
      );
    }

    if (properties) {
      for (const [name, property] of Object.entries(properties)) {
        flattenProperties.push(generateFlattenProperty(name, property));
      }
    }

    const flattenFunctionData = {
      flattenProperties: flattenProperties,
    };

    return this.generateTemplateStr(flattenFunctionTemplate, {
      ...flattenFunctionData,
      ...objectData,
    });
  }
}
