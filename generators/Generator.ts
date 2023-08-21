import { Config } from "../Config";
import mustache from "mustache";
import fs from "fs";
import { SchemaGenerator } from "./SchemaGenerator";
import { Swagger } from "../Swagger";

export class Generator {
  private config: Config;
  private swagger: Swagger;
  private dataSourceTestTemplate: string;
  private resourceTestTemplate: string;
  private apisTemplate: string;
  private resourceDocTemplate: string;
  private dataSourceDocTemplate: string;
  private packageFolder: string;

  constructor(config: Config, swagger: Swagger) {
    this.config = config;
    this.swagger = swagger;
    this.dataSourceTestTemplate = "templates/dataSourceTest.mustache";
    this.resourceTestTemplate = "templates/resourceTest.mustache";
    this.packageFolder = `output/${this.config.package}`;
    this.apisTemplate = "templates/docs/apis.mustache"
    this.resourceDocTemplate = "templates/docs/resource.mustache";
    this.dataSourceDocTemplate = "templates/docs/dataSource.mustache";
  }

  public generateResource() {
    //  Create the resource folder if it doesn't exist
    try {
      if (!fs.existsSync("output")) {
        fs.mkdirSync("output");
      }
    } catch (err) {
      console.error(err);
    }

    //  Create the resource folder if it doesn't exist
    try {
      if (!fs.existsSync(this.packageFolder)) {
        fs.mkdirSync(this.packageFolder);
      }
    } catch (err) {
      console.error(err);
    }

    // Generate the resource schema
    const schemaGenerator = new SchemaGenerator(
      this.swagger.definitions[this.config.rootObject],
      this.swagger.definitions
    );
    schemaGenerator.generate()

    // Check if the user wants test files made
    if (this.config.testFiles) {
      this.generateTests();
    }

    // Check if the user wants documentation made
    if (this.config.documentation) {
      this.generateDocs();
    }
  }

  private generateTests() {
    // Generate resource test file
    const resourceTestData = {};
    this.generateFile(
      this.resourceTestTemplate,
      resourceTestData,
      `${this.packageFolder}/resourceTest.go`
    );

    // Generate data source test file
    const docTestData = {};
    this.generateFile(
      this.dataSourceTestTemplate,
      docTestData,
      `${this.packageFolder}/dataSourceTest.go`
    );
  }

  private generateDocs() {
    // Generate apis file
    const APIdata = {};
    this.generateFile(
      this.apisTemplate,
      APIdata,
      `${this.packageFolder}/apis.md`
    );

    // Generate resource example file
    const resourceDocData = {};
    this.generateFile(
      this.resourceDocTemplate,
      resourceDocData,
      `${this.packageFolder}/resource.tf`
    );

    // Generate data source example file
    const dataSourceDocData = {};
    this.generateFile(
      this.dataSourceDocTemplate,
      dataSourceDocData,
      `${this.packageFolder}/data-source.tf`
    );
  }

  /**
   * Generate a file using a template and data
   * @param template file template location
   * @param data the data to be used by the template
   * @param destination the destination of the output file
   */
  private generateFile(template: string, data: object, destination: string) {
    const templateText = fs.readFileSync(template, "utf-8");

    // generate the resource test file from the template and data
    const output = mustache.render(templateText, data);

    // Save the generated output to a file
    fs.writeFileSync(destination, output, "utf-8");
  }
}
