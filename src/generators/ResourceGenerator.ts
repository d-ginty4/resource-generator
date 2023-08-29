import {
  camelToPascal,
  camelToSnake,
  pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";
import { SwaggerSchemaProperty } from "../types/Swagger";

export class ResourceGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = "src/templates/resource.mustache";
    this.outputLocation = `output/${this.config.package}/resource.go`;
  }

  public generate() {
    const resourceData = {
      readProperties: this.generateReadStatements(),
    };

    this.generateFile(this.template, resourceData, this.outputLocation);
  }

  private generateReadStatements(): string[] {
    const mainObjectName = this.config.rootObject;
    const mainObject = this.swagger.definitions[mainObjectName];
    const properties = mainObject.properties;

    const readStatements: string[] = [];

    if (properties === undefined) {
      return [];
    }
    for (const [propertyName, property] of Object.entries(properties)) {
      if (this.isIgnorableProperty(propertyName)) {
        continue;
      } else if (!this.isBasicType(property.type)) {
        readStatements.push(
          this.handleComplexType(propertyName, property, mainObjectName)
        );
        continue;
      }

      readStatements.push(
        `resourcedata.SetNillableValue(d, "${camelToSnake(
          propertyName
        )}", ${pascalToCamel(mainObjectName)}.${camelToPascal(propertyName)})`
      );
    }
    return readStatements;
  }

  private handleComplexType(
    propertyName: string,
    property: SwaggerSchemaProperty,
    mainObjectName: string
  ): string {
    if (property.type === "array") {
      // handle array of objects
      if (property.items !== undefined) {
        const nestedObjectName = property.items.$ref.split("/")[2];
        return `resourcedata.SetNillableValue(d, "${camelToSnake(
          propertyName
        )}", ${pascalToCamel(mainObjectName)}.${camelToPascal(
          propertyName
        )}, flatten${camelToPascal(nestedObjectName)}s)`;
      }
      // handle array of strings
      return "";
    }
    return "";
  }
}
