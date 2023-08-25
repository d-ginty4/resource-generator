import { Config } from "../types/Config";
import { generateFile } from "../utils/fileOperations";
import { snakeToEnglish, snakeToPascal } from "../utils/variableRenames";
import { Definitions, SwaggerSchema, SwaggerSchemaProperty } from "../types/Swagger";
import schemaTypes from "../utils/schemaTypes";

export class SchemaGenerator {
  private mainObject: SwaggerSchema;
  private objects: Definitions;
  private schemaTemplate: string;
  private outputSchemaLocation: string;
  private config: Config;
  private nestedObjects: object[];

  constructor(config: Config, mainObject: SwaggerSchema, objects: Definitions) {
    this.config = config;
    this.mainObject = mainObject;
    this.objects = objects;
    this.schemaTemplate = "templates/schema.mustache";
    this.outputSchemaLocation = `output/${this.config.package}/schema.go`;
    this.nestedObjects = [];
  }

  public generate() {
    const schemaData = {
      resourceName: this.config.package,
      funcName: snakeToPascal(this.config.package),
      englishName: snakeToEnglish(this.config.package),
      properties: this.createProperties(
        this.mainObject.required,
        this.mainObject.properties
      ),
      nestedObjects: this.nestedObjects,
    };
    this.operationFunctionNames(schemaData);

    generateFile(this.schemaTemplate, schemaData, this.outputSchemaLocation);
  }

  private createProperties(
    required: string[] | undefined,
    properties: { [propertyName: string]: SwaggerSchemaProperty } | undefined
  ): object[] {
    const propertyData: object[] = [];
    if (properties === undefined) {
      return [];
    }

    for (const [propertyName, property] of Object.entries(properties)) {
      let isRequired = false;
      if (required && required.includes(propertyName)) {
        isRequired = true;
      }

      if (
        propertyName === "id" ||
        propertyName === "selfUri" ||
        propertyName === "version" ||
        propertyName === "dateCreated" ||
        propertyName === "dateModified"
      ) {
        continue;
      }

      const data = this.createPropertyData(propertyName, property, isRequired);
      propertyData.push(data);
    }
    return propertyData;
  }

  private createPropertyData(
    propertyName: string,
    property: SwaggerSchemaProperty,
    isRequired: boolean
  ): object {
    const data: { [key: string]: any } = {};
    data.name = propertyName;
    data.description = property.description;
    data.type = schemaTypes.get(property.type);

    if (property.items !== undefined) {
      const referenceObject = this.extractObjectName(property.items.$ref);
      data.nestedResource = referenceObject;
      const nestedObject = {
        objectName: referenceObject,
        properties: this.createProperties(
          this.objects[referenceObject].required,
          this.objects[referenceObject].properties
        )
      }
      this.nestedObjects.push(nestedObject);
    }

    if (isRequired) {
      data.required = true;
    } else {
      data.required = false;
    }

    return data;
  }

  private extractObjectName(reference: string): string {
    const segments = reference.split("/");
    return segments[segments.length - 1];
  }

  private operationFunctionNames(schema: any) {
    for (const operation of this.config.operations) {
      if (operation.type === "getAll") {
        schema[
          `dataSourceReadFunctionName`
        ] = `dataSource${schema.funcName}Read`;
        schema["exporterGetFunctionName"] = `getAll${schema.funcName}Exporter`;
      } else {
        schema[
          `${operation.type}FunctionName`
        ] = `${operation.type}${schema.funcName}`;
      }
    }
  }
}
