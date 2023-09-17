import { PropertyData } from "./PropertyData";

export class ObjectData {
  private properties: PropertyData[];

  constructor() {
    this.properties = [];
  }

  public addProperty(property: PropertyData): void {
    this.properties.push(property);
  }

  public getProperties(): PropertyData[] {
    return this.properties;
  }
}
