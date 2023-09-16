import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";

class DataSourceGenerator extends Generator {
  templateGenerator: TemplateGenerator;

  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  public generate() {
    if (Generator.skeltonStructure || Generator.config.skeletonDataSourceFile) {
      console.info(
        `Creating data source skeleton structure for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate("dataSource", {
        skeletonStructure: true,
      });
      console.info(
        `Created data source skeleton structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(
      `Creating data source file for ${Generator.globalData.englishName}`
    );
    this.templateGenerator.generate("dataSource");
    console.info(
      `Created data source file for ${Generator.globalData.englishName}`
    );
  }
}

export default new DataSourceGenerator();
