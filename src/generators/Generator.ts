// packages
import * as yaml from "js-yaml";
import * as fs from "fs";
import * as mustache from "mustache";

// types
import { Config } from "../types/Config";
import { Swagger } from "../types/Swagger";
import { GlobalData } from "../types/GlobalData";

// helper functions
import {
  goSdkName,
  pascalToCamel,
  snakeToCamel,
  snakeToEnglish,
  snakeToPascal,
} from "../utils/variableRenames";

export abstract class Generator {
  protected config: Config;
  protected swagger: Swagger;
  protected globalData: GlobalData;
  protected ignoreProperties: string[];
  protected basicTypes: string[];
  abstract template: string;
  abstract outputLocation: string;

  constructor() {
    this.config = this.setConfig();
    this.swagger = this.setSwagger();
    this.globalData = this.setGlobalData();
    this.ignoreProperties = [
      "id",
      "dateCreated",
      "dateModified",
      "version",
      "selfUri",
    ];
    this.basicTypes = ["string", "integer", "boolean"];
  }

  /**
   * Generate a file using a template and data
   * @param template file template location
   * @param data the data to be used by the template
   * @param destination the destination of the output file
   */
  protected generateFile(template: string, data: object, destination: string) {
    const templateText = fs.readFileSync(template, "utf-8");

    const allData = { ...data, ...this.globalData };

    // generate the resource test file from the template and data
    const output = mustache.render(templateText, allData);

    // Save the generated output to a file
    fs.writeFileSync(destination, output, "utf-8");
  }

  protected isIgnorableProperty(propertyName: string): boolean {
    return this.ignoreProperties.includes(propertyName);
  }

  protected isBasicType(type: string): boolean {
    return this.basicTypes.includes(type);
  }

  protected extractObjectName(reference: string): string {
    const segments = reference.split("/");
    return segments[segments.length - 1];
  }

  // TODO: throw error if config is wrong
  private setConfig(): Config {
    const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
    const data: Config = yaml.load(yamlFileContent) as Config;
    return data;
  }

  // TODO: throw error if swagger is wrong?
  // TODO: read swagger from url
  private setSwagger(): Swagger {
    const jsonFileContent = fs.readFileSync("swagger.json", "utf-8");
    const jsonData: Swagger = JSON.parse(jsonFileContent) as Swagger;
    return jsonData;
  }

  private setGlobalData(): GlobalData {
    const resourceName = this.config.package;
    const data: GlobalData = {
      englishName: snakeToEnglish(resourceName),
      camelName: snakeToCamel(resourceName),
      pascalName: snakeToPascal(resourceName),
      snakeName: resourceName,
      mainObject: this.config.rootObject,
      mainObjectCamel: pascalToCamel(this.config.rootObject),
      mainObjectGoSDK: goSdkName(this.config.rootObject),
    };

    return data;
  }
}
