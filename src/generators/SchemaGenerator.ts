import { Definitions, SwaggerSchemaProperty } from "../types/Swagger";
import schemaTypes from "../utils/schemaTypes";
import { Generator } from "./Generator";

export class SchemaGenerator extends Generator {
  template: string;
  outputLocation: string;
  private objects: Definitions;
  private nestedObjectsNew: object[];

  constructor() {
    super();
    this.template = "src/templates/schema/schema.mustache";
    this.outputLocation = `output/${this.config.package}/resource_genesyscloud_${this.globalData.snakeName}_schema.go`;
    this.objects = this.swagger.definitions;
    this.nestedObjectsNew = [];
  }

  public generate() {
    const schemaData = {
      properties: this.createProperties(
        this.objects[this.globalData.mainObject].required,
        this.objects[this.globalData.mainObject].properties
      ),
      nestedObjects: this.nestedObjects,
    };

    this.generateFile(this.template, this.outputLocation, schemaData);
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

      if (this.isIgnorableProperty(propertyName)) {
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
      const referenceObject = property.items.$ref.split("/")[2];
      data.nestedResource = referenceObject;
      const nestedObject = {
        objectName: referenceObject,
        properties: this.createProperties(
          this.objects[referenceObject].required,
          this.objects[referenceObject].properties
        ),
      };
      this.nestedObjectsNew.push(nestedObject);
    }

    if (isRequired) {
      data.required = true;
    } else {
      data.required = false;
    }

    return data;
  }
}
