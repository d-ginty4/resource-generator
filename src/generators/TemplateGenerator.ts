import * as fs from "fs";
import handlebars from "../utils/handlerbarsSetup";

import { Generator } from "./Generator";
import templates from "../utils/templates";

export class TemplateGenerator extends Generator {
  constructor() {
    super();
    handlebars.registerHelper("eq", function (a, b) {
      return a === b;
    });
  }

  public generate(
    file: string,
    data?: object,
    writeToFile?: boolean
  ): string | void {
    if (!writeToFile) {
      return this.generateTemplate(templates.get(file)!, data);
    }
    const output = this.getFileLocations(file);
    this.generateTemplate(templates.get(file)!, data, output);
  }

  /**
   * Generate a template using data
   * @param template file template location
   * @param destination the destination of the output file
   * @param data the data to be used by the template
   */
  private generateTemplate(
    templateFile: string,
    data?: object,
    destination?: string
  ): string | void {
    // check if the template file exists
    try {
      fs.accessSync(templateFile, fs.constants.R_OK);
    } catch (err) {
      throw new Error(`Template file ${templateFile} does not exist`);
    }
    // read the template file
    const templateText = fs.readFileSync(templateFile, "utf-8");

    // Compile the template
    const template = handlebars.compile(templateText);

    // combine the global data and the data passed in
    const allData = { ...Generator.globalData, ...data };

    // generate the file from the template and data
    const output = template(allData);

    if (!destination) {
      return output;
    } else {
      // Save the generated output to a file
      fs.writeFileSync(destination, output, "utf-8");
    }
  }

  /**
   * Return the location data for file type i.e. template location and output destination
   * @param fileType file type e.g. schema
   */
  private getFileLocations(fileType: string): string {
    const packageName = Generator.config.package;
    switch (fileType) {
      case "schema":
        return `output/${packageName}/resource_genesyscloud_${packageName}_schema.go`
      case "proxy":
        return `output/${packageName}/genesyscloud_${packageName}_proxy.go`
      case "resource":
        return `output/${packageName}/resource_genesyscloud_${packageName}.go`
      case "utils":
        return `output/${packageName}/resource_genesyscloud_${packageName}_utils.go`
      case "dataSource":
        return `output/${packageName}/data_source_genesyscloud_${packageName}.go`
      case "initTest":
        return `output/${packageName}/genesyscloud_${packageName}_init_test.go`
      case "dataSourceTest":
        return `output/${packageName}/data_source_genesyscloud_${packageName}_test.go`
      case "resourceTest":
        return `output/${packageName}/resource_genesyscloud_${packageName}_test.go`
      default:
        throw new Error(`Unknown file type ${fileType}`);
    }
  }
}
