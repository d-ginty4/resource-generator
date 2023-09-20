import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";
import UtilsGenerator from "./UtilsGenerator";

class ResourceGenerator extends Generator {
  templateGenerator: TemplateGenerator;

  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generate the resource file
  public generate() {
    console.info(`Creating resource file for ${Generator.config.package}`);

    let data: { skeletonStructure: boolean } = { skeletonStructure: false };
    if (Generator.skeltonStructure || Generator.config.skeletonResourceFile) {
      data.skeletonStructure = true;
    }

    this.templateGenerator.generate(
      "resource",
      {
        ...Generator.parentObject,
        ...data,
      },
      true
    );
    console.info(`Created resource file for ${Generator.config.package}`);

    if (!Generator.skeltonStructure || !Generator.config.skeletonResourceFile) {
      // generate the utils file
      console.info(`Creating utils file for ${Generator.config.package}`);
      UtilsGenerator.generate();
      console.info(`Created utils file for ${Generator.config.package}`);
    }
  }
}

export default new ResourceGenerator();
