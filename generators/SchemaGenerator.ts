export class SchemaGenerator {
  private mainObject: any;
  private objects: any;

  constructor(mainObject: any, objects: any) {
    this.mainObject = mainObject;
    this.objects = objects;
  }

  public generate() {
    const data = this.createObject();
  }

  private createObject() {
    const properties = this.mainObject.properties;

    for (const property in properties) {
      //console.log(properties[property]);
      if (properties[property]["items"] === undefined) {
        this.createProperty(property, properties[property]);
      } else {
        console.log(`${property} is a nested object`);
      }
    }
  }

  private createProperty(name: string, property: any): string {
    const stringProperty = `
            "${name}": {
                Description: "${property["description"]}",
                Optional: true
                Type: schema.TypeString
            }
        `;

    const integerProperty = `
            "${name}": {
                Description: "${property["description"]}",
                Optional: true
                Type: schema.TypeInt
            }
        `;

    if (property["type"] === "string") {
      return stringProperty;
    } else if (property["type"] === "integer") {
      return integerProperty;
    } else {
      return "";
    }
  }

  private createMain(): string {
    return `
        return &schema.Resource{
            Description: "Genesys Cloud outbound ruleset",

            CreateContext: gcloud.CreateWithPooledClient(createOutboundRuleset),
            ReadContext:   gcloud.ReadWithPooledClient(readOutboundRuleset),
            UpdateContext: gcloud.UpdateWithPooledClient(updateOutboundRuleset),
            DeleteContext: gcloud.DeleteWithPooledClient(deleteOutboundRuleset),
            Importer: &schema.ResourceImporter{
                StateContext: schema.ImportStatePassthroughContext,
            },
            SchemaVersion: 1,
            Schema: map[string]*schema.Schema{
                
            },
        }
    `;
  }
}
