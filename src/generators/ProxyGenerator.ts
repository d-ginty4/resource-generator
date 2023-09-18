import { camelToPascal, pascalToCamel } from "../utils/variableRenames";
import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";

interface ProxyData {
  api: string; // e.g. OutboundApi
  apiCamel: string; // e.g. outboundApi
  [method: string]: string; // e.g. readMethod: GetOutboundCallabletimeset
}

class ProxyGenerator extends Generator {
  templateGenerator: TemplateGenerator;
  
  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generates the proxy file
  public generate() {
    if (Generator.skeltonStructure || Generator.config.skeletonProxyFile) {
      console.info(
        `Creating proxy file structure for ${Generator.globalData.englishName}`
      );
      this.templateGenerator.generate("proxy", {
        skeletonStructure: true,
      }, true);
      console.info(
        `Created proxy file structure for ${Generator.globalData.englishName}`
      );
      return;
    }

    console.info(`Creating proxy file for ${Generator.globalData.englishName}`);
    // find the get/read operation
    const getOperation = Generator.config.operations.find(
      (operation) => operation.type === "read"
    ) || { path: "" };

    // create the go sdk api class name e.g. OutboundApi
    const tag = Generator.swagger.paths[getOperation.path].get.tags[0];
    const resourceApi = `${tag.replace(/\s+/g, "")}Api`;

    if (resourceApi === "Api") {
      throw new Error("Unable to find resource's api");
    }

    const proxyData: ProxyData = {
      api: resourceApi,
      apiCamel: pascalToCamel(resourceApi),
    };
    this.getMethodNames(proxyData);

    this.templateGenerator.generate("proxy", proxyData, true);
    console.info(`Created proxy file for ${Generator.globalData.englishName}`);
  }

  // get the go sdk method name for each operation
  private getMethodNames(proxyData: ProxyData) {
    for (const operation of Generator.config.operations) {
      const methodName =
        Generator.swagger.paths[operation.path][operation.method.toLowerCase()]
          .operationId;
      proxyData[`${operation.type}Method`] = camelToPascal(methodName);
    }
  }
}

export default new ProxyGenerator();
