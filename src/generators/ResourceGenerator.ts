import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";
import UtilsGenerator from "./UtilsGenerator";

interface UtilsData {
  noUtils: boolean;
  buildFuncs: string[];
  flattenFuncs: string[];
}

class ResourceGenerator extends Generator {
  templateGenerator: TemplateGenerator;

  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generate the resource file
  public generate() {
    console.info(`Creating resource file for ${Generator.config.package}`);

    let presentMethods: { [key: string]: boolean } = {};
    if (Generator.config.operations) {
      for (const operation of Generator.config.operations) {
        presentMethods[`${operation.type}Method`] = true;
      }
    }

    let data: { skeletonStructure: boolean } = { skeletonStructure: false };
    if (Generator.skeltonStructure || Generator.config.skeletonResourceFile) {
      data.skeletonStructure = true;
    }

    let utilData: UtilsData = {
      noUtils: false,
      buildFuncs: [],
      flattenFuncs: [],
    };
    if (Generator.config.noUtilsFile || !this.hasNestedObjects()) {
      utilData.noUtils = true;
      const { buildFuncs, flattenFuncs } = UtilsGenerator.generateFunctions();
      utilData.buildFuncs = buildFuncs;
      utilData.flattenFuncs = flattenFuncs;
    }

    this.templateGenerator.generate(
      "resource",
      {
        ...Generator.parentObject,
        ...data,
        ...utilData,
        ...presentMethods,
      },
      true
    );
    console.info(`Created resource file for ${Generator.config.package}`);

    if (
      !Generator.skeltonStructure &&
      !Generator.config.skeletonResourceFile &&
      !Generator.config.noUtilsFile &&
      this.hasNestedObjects()
    ) {
      // generate the utils file
      console.info(`Creating utils file for ${Generator.config.package}`);
      UtilsGenerator.generate();
      console.info(`Created utils file for ${Generator.config.package}`);
    }
  }

  private hasNestedObjects(): boolean {
    for (const property of Generator.parentObject.getProperties()){
      if (property.getNestedObject() !== undefined){
        return true
      }
    }
    
    return false
  }
}

export default new ResourceGenerator();
