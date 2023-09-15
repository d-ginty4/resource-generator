import templates from "../utils/templates";
import { Generator } from "./Generator";

export class DataSourceGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = templates.get("dataSource")!;
    this.outputLocation = this.getOutputLocation("dataSource");
  }

  public generate() {
    if (Generator.skeltonStructure || Generator.config.skeletonDataSourceFile) {
      console.info(
        `Creating data source file structure for ${Generator.globalData.englishName}`
      );
      this.generateFile(this.template, this.outputLocation, {
        skeletonStructure: true,
      });
      console.info(
        `Created data source file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(
      `Creating data source file for ${Generator.globalData.englishName}`
    );
    this.generateFile(this.template, this.outputLocation);
    console.info(
      `Created data source file for ${Generator.globalData.englishName}`
    );
  }
}
