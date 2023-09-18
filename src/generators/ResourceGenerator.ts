import { pascalToCamel } from "../utils/variableRenames";
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
    if (Generator.skeltonStructure || Generator.config.skeletonResourceFile) {
      console.info(
        `Creating resource file structure for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate(
        "resource",
        {
          skeletonStructure: true,
        },
        true
      );
      console.info(
        `Created resource file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(
      `Creating resource file for ${Generator.globalData.englishName}`
    );
    this.templateGenerator.generate(
      "resource",
      {
        readProperties: this.generateReadStatements(),
      },
      true
    );
    console.info(
      `Created resource file for ${Generator.globalData.englishName}`
    );

    if (!Generator.skeltonStructure || !Generator.config.skeletonResourceFile) {
      // generate the utils file
      console.info(
        `Creating utils file for ${Generator.globalData.englishName}`
      );
      UtilsGenerator.generate();
      console.info(
        `Created utils file for ${Generator.globalData.englishName}`
      );
    }
  }

  // generate the statements needed read the properties of the main object
  private generateReadStatements(): string[] {
    const readStatements: string[] = [];

    Generator.parentObject.getProperties().forEach((property) => {
      readStatements.push(
        this.templateGenerator.generate("readProperty", {
        ...property,
        objectName: pascalToCamel(Generator.config.mainObject),
      })!
      );
    });

    return readStatements;
  }
}

export default new ResourceGenerator();
