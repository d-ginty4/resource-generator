import {
  camelToPascal,
  camelToSnake,
  pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";
import { SwaggerSchemaProperty } from "../types/Swagger";
import { UtilsGenerator } from "./UtilsGenerator";
import { TemplateGenerator } from "./TemplateGenerator";

class ResourceGenerator extends Generator {
  templateGenerator: TemplateGenerator;

  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generate the resource file
  public generate() {
    if (Generator.skeltonStructure || Generator.config.skeletonResourceFile) {
      console.info(
        `Creating resource file structure for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate("resource", {
        skeletonStructure: true,
      });
      console.info(
        `Created resource file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(
      `Creating resource file for ${Generator.globalData.englishName}`
    );
    const resourceData = {
      readProperties: this.generateReadStatements(),
    };

    this.templateGenerator.generate("resource", resourceData);
    console.info(
      `Created resource file for ${Generator.globalData.englishName}`
    );

    if (!Generator.skeltonStructure || !Generator.config.skeletonResourceFile) {
      // generate the utils file
      const utilsGenerator = new UtilsGenerator();
      utilsGenerator.generate();
    }
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
        throw new Error(
          `Unable to handle nested object array ${name}: ${property}`
        );
      default:
        throw new Error(`Unknown property ${name}: ${property}`);
    }
  }

  // generate the read statement for a property using the template
  private generateReadStatement(
    property: string,
    readFunction?: string
  ): string {
    const objectName = pascalToCamel(Generator.config.mainObject);
    const readPropertyData = {
      property: camelToSnake(property),
      objectName: objectName,
      objectProperty: camelToPascal(property),
      readFunction: readFunction,
    };

    return this.templateGenerator.generate(
      "readProperty",
      readPropertyData,
      false
    )!;
  }
}

export default new ResourceGenerator();
