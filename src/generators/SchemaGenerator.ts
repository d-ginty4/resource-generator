import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";
import Resource from "../classes/Resource";

// This class generates a terraform schema for the main object and all nested objects
class SchemaGenerator extends Generator {
  templateGenerator: TemplateGenerator;
  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generates the terraform schema file
  public generate() {
    console.info(`Creating schema file for ${Generator.config.mainObject}`);
    if (Generator.skeltonStructure || Generator.config.skeletonSchemaFile) {
      this.templateGenerator.generate(
        "schema",
        {
          skeletonStructure: true,
        },
        true
      );
      return;
    }

    this.templateGenerator.generate(
      "schema",
      {
        ...Generator.parentObject,
        nestedObjectSchemas: this.generateNestedSchemas(
          Generator.parentObject,
          []
        ),
      },
      true
    );
    console.info(`Created schema file for ${Generator.config.mainObject}`);
  }

  private generateNestedSchemas(obj: Resource, tfSchemas: string[]): string[] {
    obj.getProperties().forEach((property) => {
      if (property.getNestedObject()) {
        tfSchemas = this.generateNestedSchemas(
          property.getNestedObject()!,
          tfSchemas
        );
        const schemaData = {
          objectName: property.getNestedObject()!.getName(),
          properties: this.generateProperties(property.getNestedObject()!),
        };
        tfSchemas.push(
          this.templateGenerator.generate("nestedSchema", schemaData)!
        );
      }
    });
    return tfSchemas;
  }

  private generateProperties(obj: Resource): string[] {
    const tfProperties: string[] = [];
    obj.getProperties().forEach((property) => {
      tfProperties.push(
        this.templateGenerator.generate("schemaProperty", property)!
      );
    });
    return tfProperties;
  }
}

export default new SchemaGenerator();
