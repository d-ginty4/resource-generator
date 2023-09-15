import { SwaggerSchema, SwaggerSchemaProperty } from "../types/Swagger";
import schemaTypes from "../utils/schemaTypes";
import { Generator } from "./Generator";
import templates from "../utils/templates";
import { camelToSnake } from "../utils/variableRenames";

interface SchemaPropertyData {
  name: string;
  description: string;
  required: boolean;
  type: string;
  singleItem?: boolean;
  element?: string;
}

// This class generates a terraform schema for the main object and all nested objects
export class SchemaGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = templates.get("schema")!
    this.outputLocation = this.getOutputLocation("schema");
  }

  // generates the terraform schema file
  public generate() {
    if (Generator.skeltonStructure || Generator.config.skeletonSchemaFile) {
      console.info(
        `Creating schema file structure for ${Generator.globalData.englishName}`
      );
      this.generateFile(this.template, this.outputLocation, {
        skeletonStructure: true,
      });
      console.info(
        `Created schema file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(`Creating schema file for ${Generator.config.mainObject}`);
    const schemaData = {
      properties: this.createProperties(Generator.mainObject),
      nestedObjectSchemas: this.createNestedObjectSchemas(),
    };

    this.generateFile(this.template, this.outputLocation, schemaData);
    console.info(`Created schema file for ${Generator.config.mainObject}`);
  }

  // creates a terraform schema for each nested object
  private createNestedObjectSchemas(): string[] {
    const nestedResourceTemplate = templates.get("nestedSchema")!;
    const nestedObjectSchemas: string[] = [];

    // iterate through nested objects in reverse order so that the nested objects are created in the correct order
    for (const nestedObjectName of Generator.nestedObjects.reverse()) {
      console.info(`Creating nested schema for ${nestedObjectName}`);
      const nestedObject = Generator.swagger.definitions[nestedObjectName];
      if (!nestedObject) {
        throw new Error(
          `The nested object ${nestedObjectName} does not exist in the swagger file`
        );
      }
      const nestedObjectData = {
        objectName: nestedObjectName,
        properties: this.createProperties(nestedObject),
      };

      nestedObjectSchemas.push(
        this.generateTemplateStr(nestedResourceTemplate, nestedObjectData)
      );
      console.info(`Created nested schema for ${nestedObjectName}`);
    }

    return nestedObjectSchemas;
  }

  // translates an objects properties into terraform schema properties
  private createProperties(object: SwaggerSchema): string[] {
    const properties = object.properties;
    const required = object.required;
    const propertiesTF: string[] = [];

    if (properties) {
      for (const [propertyName, property] of Object.entries(properties)) {
        if (this.isIgnorableProperty(propertyName)) {
          continue;
        }
        let isRequired = false;
        if (required && required.includes(propertyName)) {
          isRequired = true;
        }
        const propertyTF = this.generateTFProperty(
          propertyName,
          property,
          isRequired
        );
        propertiesTF.push(propertyTF);
      }
    }

    return propertiesTF;
  }

  // generates a terraform schema property using the template
  private generateTFProperty(
    name: string,
    property: SwaggerSchemaProperty,
    required: boolean
  ): string {
    const propertyTemplate = templates.get("schemaProperty")!

    const propertyData: SchemaPropertyData = {
      name: camelToSnake(name),
      description: property.description || "",
      required: required,
      type: "",
    };

    // Evaluate the type of the property
    switch (this.evaluatePropertyType(name, property)) {
      case "basic type":
        propertyData.type = schemaTypes.get(property.type)!;
        break;
      case "nested object":
        if (property.items?.$ref) {
          propertyData.type = "schema.TypeList";
          propertyData.singleItem = true;
          propertyData.element =
            property.items.$ref.split("/")[2] + "Resource,";
        }
        break;
      case "string array":
        propertyData.type = "schema.TypeList";
        propertyData.element = "&schema.Schema{Type: schema.TypeString}";
        break;
      case "nested object array":
        if (property.items?.$ref) {
          propertyData.type = "schema.TypeList";
          propertyData.element =
            property.items.$ref.split("/")[2] + "Resource,";
        }
        break;
      default:
        throw new Error(`Unknown property ${name}: ${property}`);
    }

    return this.generateTemplateStr(propertyTemplate, propertyData);
  }
}
