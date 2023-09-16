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
      console.info(
        `Creating init test file for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate("initTest");
      console.info(
        `Created init test file for ${Generator.globalData.englishName}`
      );
    }
    if (this.createTestFiles) {
      console.info(
        `Creating test files for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate("dataSourceTest");
      this.templateGenerator.generate("resourceTest");
      console.info(
        `Created test files for ${Generator.globalData.englishName}`
      );
    }
  }
}
