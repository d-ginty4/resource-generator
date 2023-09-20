import PropertyData from "./PropertyData";

export default class Resource {
  private name: string;
  private packageName?: string | undefined;
  private properties: PropertyData[];

  constructor(name: string, packageName?: string | undefined) {
    this.name = name.charAt(0).toLowerCase() + name.slice(1);
    this.packageName = packageName
      ? packageName.replace(/(_\w)/g, (match) => match[1].toUpperCase())
      : undefined;
    this.properties = [];
  }

  public getName(): string {
    return this.name;
  }

  public getPackageName(): string | undefined {
    return this.packageName || undefined;
  }

  public addProperty(property: PropertyData): void {
    this.properties.push(property);
  }

  public getProperties(): PropertyData[] {
    return this.properties;
  }
}
