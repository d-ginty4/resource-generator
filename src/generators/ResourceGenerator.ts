import {
  pascalToCamel,
} from "../utils/variableRenames";
import { Generator } from "./Generator";
//import { UtilsGenerator } from "./UtilsGenerator";
import { TemplateGenerator } from "./TemplateGenerator";

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
      this.templateGenerator.generate("resource", {
        skeletonStructure: true,
      });
      console.info(
        `Created resource file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(
      `Creating resource file for ${Generator.globalData.englishName}`
    );
    const resourceData = {
      readProperties: this.generateReadStatements(),
    };

    this.templateGenerator.generate("resource", resourceData);
    console.info(
      `Created resource file for ${Generator.globalData.englishName}`
    );

    if (!Generator.skeltonStructure || !Generator.config.skeletonResourceFile) {
      // generate the utils file
      // const utilsGenerator = new UtilsGenerator();
      // utilsGenerator.generate();
    }
  }

  // generate the statements needed read the properties of the main object
  private generateReadStatements(): string[] {
    const readStatements: string[] = [];
    
    Generator.parentObject.getProperties().forEach((property) => {
      const readStatementData = {
        ...property,
        objectName: pascalToCamel(Generator.config.mainObject),
      };
      readStatements.push(
        this.templateGenerator.generate("readProperty", property, false)!
      );
    })
    
    return readStatements;
  }
}

export default new ResourceGenerator();
