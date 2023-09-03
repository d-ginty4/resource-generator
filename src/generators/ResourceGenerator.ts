import {
  camelToPascal, pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";
import { SwaggerSchemaProperty } from "../types/Swagger";
import templates from "../utils/templates";
import { UtilsGenerator } from "./UtilsGenerator";

export class ResourceGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = templates.get("resource")!
    this.outputLocation = this.getOutputLocation("resource");
  }

  // generate the resource file
  public generate() {
    console.info(`Creating resource file for ${Generator.globalData.englishName}`);
    const resourceData = {
      readProperties: this.generateReadStatements(),
    };

    this.generateFile(this.template, this.outputLocation, resourceData);
    console.info(
      `Created resource file for ${Generator.globalData.englishName}`
    );
  }

  // generate the statements needed read the properties of the main object
  private generateReadStatements(): string[] {
    const mainObject = Generator.mainObject;
    const properties = mainObject.properties;

    const readStatements: string[] = [];

    if (properties) {
      for (const [propertyName, property] of Object.entries(properties)) {
        if (!this.isIgnorableProperty(propertyName)) {
          readStatements.push(this.handleProperty(propertyName, property));
        }
      }
    }

    return readStatements;
  }

  // generate the appropriate read statement based on the property type
  private handleProperty(
    name: string,
    property: SwaggerSchemaProperty
  ): string {
    // evaluate the property type 
    switch (this.evaluatePropertyType(name, property)) {
      case "basic type":
        return this.generateReadStatement(name);
      case "nested object":
        if (property.items?.$ref) {
          const nestedObjectName = property.items.$ref.split("/")[2];
          return this.generateReadStatement(
            name,
            `flatten${camelToPascal(nestedObjectName)}`
          );
        }
        throw new Error(`Unable to handle nested object ${name}: ${property}`);
      case "string array":
        
      case "nested object array":
        if (property.items?.$ref) {
          const nestedObjectName = property.items.$ref.split("/")[2];
          return this.generateReadStatement(
            name,
            `flatten${camelToPascal(nestedObjectName)}s`
          );
        }
        throw new Error(`Unable to handle nested object array ${name}: ${property}`);
      default:
        throw new Error(`Unknown property ${name}: ${property}`);
    }
  }

  // generate the read statement for a property using the template
  private generateReadStatement(
    property: string,
    readFunction?: string
  ): string {
    const readPropertyTemplate = templates.get("readProperty")!
    const objectName = pascalToCamel(Generator.config.mainObject);
    const readPropertyData = {
      property: property,
      objectName: objectName,
      objectProperty: camelToPascal(property),
      readFunction: readFunction,
    };

    return this.generateTemplateStr(readPropertyTemplate, readPropertyData);
  }
}
