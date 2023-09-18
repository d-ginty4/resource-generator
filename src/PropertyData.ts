import { ObjectData } from "./ObjectData";
import { camelToPascal, camelToSnake } from "./utils/variableRenames";

interface TFSchemaData {
  type?: string;
  maxItems?: number;
  element?: string;
}

export class PropertyData {
  // User provided data
  private name: string = "";
  private type: string = "";
  private description: string = "";
  private required: boolean = false;
  private isStringArray?: boolean = false;
  private nestedObject?: { objectName: string; objectData: ObjectData } =
    undefined;

  // Generated data
  private snakeName: string = "";
  private pascalName: string = "";
  private flattenFunction?: string = undefined;
  private buildFunction?: string = undefined;
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

  public generateData(): void {
    this.createNames();
    this.createTFSchemaData();
    this.createUtilFunctions();
  }

  public getType(): string {
    return this.type;
  }

  public getNestedObject():
    | { objectName: string; objectData: ObjectData }
    | undefined {
    return this.nestedObject;
  }

  private createTFSchemaData(): void {
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

  private createNames(): void {
    this.snakeName = camelToSnake(this.name);
    this.pascalName = camelToPascal(this.name);
  }

  private createUtilFunctions(): void {
    // Flatten function
    if (this.type === "object") {
      this.flattenFunction = "flatten" + this.nestedObject?.objectName;
      this.buildFunction = "build" + this.nestedObject?.objectName;
    } else if (this.type === "array" && !this.isStringArray){
      this.flattenFunction = "flatten" + this.nestedObject?.objectName + "s";
      this.buildFunction = "build" + this.nestedObject?.objectName + "s";
    }
  }
}
