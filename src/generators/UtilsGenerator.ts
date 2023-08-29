import { SwaggerSchemaProperty } from "../types/Swagger";
import {
  camelToPascal,
  camelToSnake,
  goSdkName,
  pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";

interface UtilsData {
  basicProperties: object[];
  complexProperties: string[];
  nestedObjects?: object[];
}

interface NestedObjectData {
  objectCamel: string;
  objectPascal: string;
  objectGoSDK: string;
  buildProperties?: string[];
  readProperties?: string[];
}

export class UtilsGenerator extends Generator {
  template: string;
  outputLocation: string;
  private nestedObjectNames: string[];
  private complexProperties: string[];

  constructor() {
    super();
    this.template = "src/templates/utils.mustache";
    this.outputLocation = `output/${this.config.package}/utils.go`;
    this.nestedObjectNames = [];
    this.complexProperties = [];
  }

  public generate() {
    const utilsData: UtilsData = {
      basicProperties: this.setProperties(this.config.rootObject),
      complexProperties: this.complexProperties,
    };

    const nestedObjects: object[] = [];
    for (const nestedObject of this.nestedObjectNames) {
      nestedObjects.push(this.handleNestedObject(nestedObject));
    }
    utilsData.nestedObjects = nestedObjects;

    this.generateFile(this.template, utilsData, this.outputLocation);
  }

  private handleNestedObject(nestedObject: string): object {
    const objectData: NestedObjectData = {
      objectCamel: pascalToCamel(nestedObject),
      objectPascal: nestedObject,
      objectGoSDK: goSdkName(nestedObject),
      buildProperties: [],
      readProperties: [],
    };
    const currentObject = this.swagger.definitions[nestedObject];
    const properties = currentObject.properties;

    if (properties !== undefined) {
      for (const [propertyName, property] of Object.entries(properties)) {
        if (this.isIgnorableProperty(propertyName)) {
          continue;
        } else if (!this.isBasicType(property.type)) {
          this.handleComplexNestedType(
            propertyName,
            property,
            nestedObject,
            objectData.buildProperties,
            objectData.readProperties
          );

          continue;
        }

        switch (property.type) {
          case "string":
            objectData.buildProperties?.push(
              this.generateBuildStringValueStatement(propertyName, nestedObject)
            );
            objectData.readProperties?.push(
              this.generateReadValueStatement(propertyName, nestedObject)
            );
            break;
          case "integer":
            objectData.buildProperties?.push(
              this.generateBuildIntegerValueStatement(
                propertyName,
                nestedObject
              )
            );
            objectData.readProperties?.push(
              this.generateReadValueStatement(propertyName, nestedObject)
            );
            break;
          case "boolean":
            objectData.buildProperties?.push(
              this.generateBuildBoolValueStatement(propertyName, nestedObject)
            );
            objectData.readProperties?.push(
              this.generateReadValueStatement(propertyName, nestedObject)
            );
            break;
        }
      }
    }

    return objectData;
  }

  private handleComplexNestedType(
    propertyName: string,
    property: SwaggerSchemaProperty,
    parentObject: string,
    buildProperties?: string[],
    readProperties?: string[]
  ) {
    if (property.type === "array") {
      // handle array of objects
      if (property.items !== undefined) {
        const nestedObjectName = property.items.$ref.split("/")[2];
        this.nestedObjectNames.push(nestedObjectName);
        buildProperties?.push(
          this.generateBuildNestedObjectArrayStatement(
            propertyName,
            parentObject,
            nestedObjectName
          )
        );
        readProperties?.push(
          this.generateReadNestedObjectArrayStatement(
            propertyName,
            parentObject,
            nestedObjectName
          )
        );
      }
      // handle array of strings
      return;
    }
    return;
  }

  private setProperties(objectName: string): object[] {
    const currentObject = this.swagger.definitions[objectName];
    const properties = currentObject.properties;

    if (properties === undefined) {
      return [];
    }
    const propertyData: object[] = [];
    for (const [propertyName, property] of Object.entries(properties)) {
      const data: { [key: string]: any } = {};
      if (this.isIgnorableProperty(propertyName)) {
        continue;
      } else if (!this.isBasicType(property.type)) {
        this.complexProperties.push(
          this.handleComplexType(propertyName, property)
        );
        continue;
      }

      data.propertyCamel = propertyName;
      data.propertyPascal = camelToPascal(propertyName);
      data.propertySnake = camelToSnake(propertyName);
      switch (property.type) {
        case "string":
          data.type = "string";
          break;
        case "integer":
          data.type = "int";
          break;
        case "boolean":
          data.type = "bool";
          break;
      }

      propertyData.push(data);
    }

    return propertyData;
  }

  private handleComplexType(
    propertyName: string,
    property: SwaggerSchemaProperty
  ): string {
    if (property.type === "array") {
      // handle array of objects
      if (property.items !== undefined) {
        const nestedObjectName = property.items.$ref.split("/")[2];
        this.nestedObjectNames.push(nestedObjectName);
        return this.generateNestedObjectStatement(
          propertyName,
          nestedObjectName
        );
      }
      // handle array of strings
      return "";
    }
    return "";
  }

  private generateBuildNestedObjectArrayStatement(
    propertyName: string,
    parentObject: string,
    nestedObject: string
  ): string {
    return `resourcedata.BuildSDKInterfaceArrayValueIfNotNil(&sdk${parentObject}.${camelToPascal(
      propertyName
    )}, ${pascalToCamel(parentObject)}sMap, "${camelToSnake(
      propertyName
    )}", build${nestedObject}s)`;
  }

  private generateBuildBoolValueStatement(
    propertyName: string,
    nestedObject: string
  ): string {
    return `sdk${propertyName}.${camelToPascal(
      propertyName
    )} = platformclientv2.Bool(${pascalToCamel(
      nestedObject
    )}sMap["${camelToSnake(propertyName)}"].(bool))`;
  }

  private generateBuildIntegerValueStatement(
    propertyName: string,
    nestedObject: string
  ): string {
    return `sdk${nestedObject}.${camelToPascal(
      propertyName
    )} = platformclientv2.Int(${pascalToCamel(
      nestedObject
    )}sMap["${camelToSnake(propertyName)}"].(int))`;
  }

  private generateBuildStringValueStatement(
    propertyName: string,
    nestedObject: string
  ): string {
    return `resourcedata.BuildSDKStringValueIfNotNil(&sdk${nestedObject}.${camelToPascal(
      propertyName
    )}, ${pascalToCamel(nestedObject)}sMap, "${camelToSnake(propertyName)}")`;
  }

  private generateReadNestedObjectArrayStatement(
    propertyName: string,
    currentObject: string,
    nestedObject: string
  ): string {
    return `resourcedata.SetMapInterfaceArrayValueIfNotNil(${pascalToCamel(
      currentObject
    )}Map, "${camelToSnake(propertyName)}", ${pascalToCamel(
      currentObject
    )}.${camelToPascal(propertyName)}, build${nestedObject}s)`;
  }

  private generateReadValueStatement(
    propertyName: string,
    currentObject: string
  ): string {
    return `resourcedata.SetMapValueIfNotNil(${pascalToCamel(
      currentObject
    )}Map, "${camelToSnake(propertyName)}", ${pascalToCamel(
      currentObject
    )}.${camelToPascal(propertyName)})`;
  }

  private generateNestedObjectStatement(
    propertyName: string,
    nestedObjectName: string
  ) {
    return `${camelToPascal(
      propertyName
    )}: build${nestedObjectName}s(d.Get("${camelToSnake(
      propertyName
    )}").([]interface{})),`;
  }
}
