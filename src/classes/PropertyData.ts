import Resource from "./Resource";

interface TFSchemaData {
  type?: string;
  maxItems?: number;
  element?: string;
}

export default class PropertyData {
  // User provided data
  private name: string = "";
  private type: string = "";
  private description: string = "";
  private required: boolean = false;
  private isStringArray?: boolean = false;
  private isReference?: boolean = false;

  // Generated data
  private flattenFunction?: string = undefined;
  private buildFunction?: string = undefined;
  private tfSchemaData?: TFSchemaData = undefined;
  
  private nestedObject?: Resource = undefined;

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

  public setNestedObject(objectData: Resource) {
    this.nestedObject = objectData;
  }

  public generateData(): void {
    if (this.name === "division") {
      this.name = "divisionId";
      this.type = "string";
      this.nestedObject = undefined;
    } else if (this.nestedObject?.getName() === "domainEntityRef") {
      this.type = "string";
      this.isReference = true;
      this.nestedObject = undefined;
    }
    this.createTFSchemaData();
    this.createUtilFunctions();
  }

  public getType(): string {
    return this.type;
  }

  public getNestedObject(): Resource | undefined {
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
      case "number":
        schemaProperties.type = "schema.TypeFloat";
        break;
      case "boolean":
        schemaProperties.type = "schema.TypeBool";
        break;
      case "array":
        schemaProperties.type = "schema.TypeList";
        if (this.isStringArray) {
          schemaProperties.element = "&schema.Schema{Type: schema.TypeString}";
        } else {
          schemaProperties.element = `${this.nestedObject?.getName()}Resource`;
        }
        break;
      case "object":
        schemaProperties.type = "schema.TypeList";
        schemaProperties.maxItems = 1;
        schemaProperties.element = `${this.nestedObject?.getName()}Resource`;
        break;
      default:
        throw new Error(`Unknown type ${this.type}`);
    }
    this.tfSchemaData = schemaProperties;
  }

  private createUtilFunctions(): void {
    if (!this.nestedObject) {
      return;
    }
    const pascalName =
      this.nestedObject?.getName().charAt(0).toUpperCase() +
      this.nestedObject?.getName().slice(1);
    // Flatten function
    if (this.type === "object") {
      this.flattenFunction = "flatten" + pascalName;
      this.buildFunction = "build" + pascalName;
    } else if (this.type === "array" && !this.isStringArray) {
      this.flattenFunction = "flatten" + pascalName + "s";
      this.buildFunction = "build" + pascalName + "s";
    }
  }
}
