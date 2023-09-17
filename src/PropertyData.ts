import { ObjectData } from "./ObjectData";

interface TFSchemaData {
  type?: string;
  maxItems?: number;
  element?: string;
}

export class PropertyData {
  private name: string = "";
  private type: string = "";
  private description: string = "";
  private required: boolean = false;
  private isStringArray?: boolean = false;
  private nestedObject?: { objectName: string; objectData: ObjectData } =
    undefined;
  private tfSchemaData?: TFSchemaData = undefined;

  public setName(name: string): void {
    this.name = name;
  }

  public setType(type: string): void {
    this.type = type;
  }

  public setDescription(description: string): void {
    this.description = description;
  }

  public setRequired(required: boolean): void {
    this.required = required;
  }

  public setIsStringArray(isStringArray: boolean): void {
    this.isStringArray = isStringArray;
  }

  public setNestedObject(
    value: { objectName: string; objectData: ObjectData } | undefined
  ) {
    this.nestedObject = value;
  }

  public getName(): string {
    return this.name;
  }

  public getType(): string {
    return this.type;
  }

  public getDescription(): string {
    return this.description;
  }

  public getRequired(): boolean {
    return this.required;
  }

  public getIsStringArray(): boolean | undefined {
    return this.isStringArray;
  }

  public getNestedObject():
    | { objectName: string; objectData: ObjectData }
    | undefined {
    return this.nestedObject;
  }

  public getTFSchemaData(): TFSchemaData | undefined {
    return this.tfSchemaData;
  }

  public createTFSchemaData(): void {
    if (!this.type) {
      throw new Error("Cannot generate TFSchemaProps without original type");
    }

    let schemaProperties: TFSchemaData = {};
    switch (this.type) {
      case "string":
        schemaProperties.type = "schema.TypeString";
        break;
      case "integer":
        schemaProperties.type = "schema.TypeInt";
        break;
      case "boolean":
        schemaProperties.type = "schema.TypeBool";
        break;
      case "array":
        schemaProperties.type = "schema.TypeList";
        if (this.isStringArray) {
          schemaProperties.element = "&schema.Schema{Type: schema.TypeString}";
        } else {
          schemaProperties.element = `${this.nestedObject?.objectName}Resource`;
        }
        break;
      case "object":
        schemaProperties.type = "schema.TypeList";
        schemaProperties.maxItems = 1;
        schemaProperties.element = `${this.nestedObject?.objectName}Resource`;
        break;
      default:
        throw new Error(`Unknown type`);
    }
    this.tfSchemaData = schemaProperties;
  }
}
