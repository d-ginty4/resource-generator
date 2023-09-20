import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";

export class TestGenerator extends Generator {
  createTestFiles: boolean;
  createInitTest: boolean;
  templateGenerator: TemplateGenerator;

  constructor(testFiles: boolean = false, initTest: boolean = false) {
    super();
    this.templateGenerator = new TemplateGenerator();
    this.createTestFiles = testFiles;
    this.createInitTest = initTest;
  }

  public generate() {
    if (this.createInitTest) {
      console.info(`Creating init test file for ${Generator.config.package}`);
      this.templateGenerator.generate("initTest", Generator.parentObject, true);
      console.info(`Created init test file for ${Generator.config.package}`);
    }
    if (this.createTestFiles) {
      console.info(`Creating test files for ${Generator.config.package}`);
      this.templateGenerator.generate(
        "dataSourceTest",
        Generator.parentObject,
        true
      );
      this.templateGenerator.generate(
        "resourceTest",
        Generator.parentObject,
        true
      );
      console.info(`Created test files for ${Generator.config.package}`);
    }
  }
}
