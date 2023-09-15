import templates from "../utils/templates";
import { Generator } from "./Generator";

export class TestGenerator extends Generator {
  template: string;
  outputLocation: string;

  createTestFiles: boolean;
  createInitTest: boolean;

  // test files templates
  initTest: string;
  dataSourceTest: string;
  resourceTest: string;

  // test files output locations
  initTestOutput: string;
  dataSourceTestOutput: string;
  resourceTestOutput: string;

  constructor(testFiles: boolean = false, initTest: boolean = false) {
    super();
    this.createTestFiles = testFiles;
    this.createInitTest = initTest;
    this.initTest = templates.get("initTest")!;
    this.dataSourceTest = templates.get("dataSourceTest")!;
    this.resourceTest = templates.get("resourceTest")!;
    this.initTestOutput = this.getOutputLocation("initTest");
    this.dataSourceTestOutput = this.getOutputLocation("dataSourceTest");
    this.resourceTestOutput = this.getOutputLocation("resourceTest");
    this.template = "";
    this.outputLocation= "";
  }

  public generate() {
    if (this.createInitTest) {
      console.info(
        `Creating init test file for ${Generator.globalData.englishName}`
      );
      this.generateFile(this.initTest, this.initTestOutput);
      console.info(
        `Created init test file for ${Generator.globalData.englishName}`
      );
    }
    if (this.createTestFiles) {
      console.info(
        `Creating test files for ${Generator.globalData.englishName}`
      );
      this.generateFile(this.dataSourceTest, this.dataSourceTestOutput);
      this.generateFile(this.resourceTest, this.resourceTestOutput);
      console.info(
        `Created test files for ${Generator.globalData.englishName}`
      );
    }
  }
}
