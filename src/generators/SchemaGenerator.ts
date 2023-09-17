import { Generator } from "./Generator";
import { camelToSnake } from "../utils/variableRenames";
import { TemplateGenerator } from "./TemplateGenerator";
import { ObjectData } from "../ObjectData";

interface SchemaPropertyData {
  name: string;
  description: string;
  required: boolean;
  type: string;
  singleItem?: boolean;
  element?: string;
}

// This class generates a terraform schema for the main object and all nested objects
class SchemaGenerator extends Generator {
  templateGenerator: TemplateGenerator;
  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generates the terraform schema file
  public generate() {
    if (Generator.skeltonStructure || Generator.config.skeletonSchemaFile) {
      console.info(
        `Creating schema file structure for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate("schema", {
        skeletonStructure: true,
      });
      console.info(
        `Created schema file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(`Creating schema file for ${Generator.config.mainObject}`);
    const data = {
      properties: this.generateProperties(Generator.parentObject),
      nestedObjectSchemas: this.generateNestedSchemas(Generator.parentObject, []),
    };
    this.templateGenerator.generate("schema", data);
    console.info(`Created schema file for ${Generator.config.mainObject}`);
  }

  private generateProperties(obj: ObjectData): string[] {
    const tfProperties: string[] = [];
    obj.getProperties().forEach((property) => {
      tfProperties.push(
        this.templateGenerator.generate("schemaProperty", property, false)!
      );
    });
    return tfProperties;
  }

  private generateNestedSchemas(obj: ObjectData, tfSchemas: string[]): string[] {
    obj.getProperties().forEach((property) => {
      if (property.getNestedObject()) {
        const schemaData = {
          objectName: property.getNestedObject()!.objectName,
          properties: this.generateProperties(
            property.getNestedObject()?.objectData!
          ),
        };
        tfSchemas.push(
          this.templateGenerator.generate("nestedSchema", schemaData, false)!
        );
        tfSchemas = this.generateNestedSchemas(
          property.getNestedObject()!.objectData,
          tfSchemas
        );
      }
    });
    return tfSchemas;
  }
}

export default new SchemaGenerator();
