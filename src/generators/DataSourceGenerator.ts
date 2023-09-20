import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";

class DataSourceGenerator extends Generator {
  templateGenerator: TemplateGenerator;

  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  public generate() {
    console.info(`Creating data source file for ${Generator.config.package}`);
    if (Generator.skeltonStructure || Generator.config.skeletonDataSourceFile) {
      this.templateGenerator.generate(
        "dataSource",
        {
          skeletonStructure: true,
        },
        true
      );

      return;
    }

    this.templateGenerator.generate("dataSource", Generator.parentObject, true);
    console.info(`Created data source file for ${Generator.config.package}`);
  }
}

export default new DataSourceGenerator();
