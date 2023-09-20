// types
import { Config } from "../types/Config";
import { Swagger, SwaggerSchema } from "../types/Swagger";

import PropertyData from "../classes/PropertyData";
import Resource from "../classes/Resource";
import readSwagger from "../utils/readSwagger";
import readConfig from "../utils/readConfig";

export abstract class Generator {
  // protected properties
  protected static config: Config;
  protected static swagger: Swagger;
  protected static skeltonStructure: boolean;
  protected static parentObject: Resource;

  // private properties
  private ignorableProperties: string[] = [];

  constructor() {
    Generator.config = readConfig();
    Generator.swagger = readSwagger();
    if (!Generator.config.operations || Generator.config.skeleton) {
      console.info("Generating skeleton structure");
      Generator.skeltonStructure = true;
    }

    const properties: string[] = [
      "id",
      "dateCreated",
      "dateModified",
      "version",
      "createdBy",
      "selfUri",
    ];
    if (Generator.config.ignoreProperties) {
      this.ignorableProperties = [
        ...Generator.config.ignoreProperties,
        ...properties,
      ];
    } else {
      this.ignorableProperties = properties;
    }

    if (!Generator.parentObject) {
      Generator.parentObject = this.setObject(
        Generator.config.mainObject,
        Generator.swagger.definitions[Generator.config.mainObject],
        Generator.config.package
      );
    }
  }

  private setObject(name: string, object: SwaggerSchema, packageName?: string): Resource {
    const required = object.required || [];
    const properties = object.properties;
    const tempObject = new Resource(name, packageName);

    if (properties) {
      for (const [propertyName, property] of Object.entries(properties)) {
        if (this.ignorableProperties.includes(propertyName)) {
          continue;
        }
        const prop = new PropertyData();
        prop.setName(propertyName);
        property.type ? prop.setType(property.type) : prop.setType("object");
        property.description
          ? prop.setDescription(property.description)
          : prop.setDescription("");
        required.includes(propertyName)
          ? prop.setRequired(true)
          : prop.setRequired(false);

        if (prop.getType() === "array") {
          if (property.items?.type === "string") {
            prop.setIsStringArray(true);
            continue;
          }
          if (property.items?.$ref) {
            const objName = property.items?.$ref.split("/")[2]!;
            prop.setNestedObject(
              this.setObject(objName, Generator.swagger.definitions[objName])
            );
          }
        } else if (prop.getType() === "object") {
          const objName = property.$ref?.split("/")[2]!;

          prop.setNestedObject(
            this.setObject(objName, Generator.swagger.definitions[objName])
          );
        }
        prop.generateData();

        tempObject.addProperty(prop);
      }
    }

    return tempObject;
  }
}
