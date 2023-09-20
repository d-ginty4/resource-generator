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
    console.info(`Creating proxy file for ${Generator.config.package}`);

    if (Generator.skeltonStructure || Generator.config.skeletonProxyFile) {
      this.templateGenerator.generate("proxy", {
        skeletonStructure: true,
      }, true);
      return;
    }

    // get the first operation
    const operation = Generator.config.operations[0]

    // create the go sdk api class name e.g. OutboundApi
    const path = Generator.swagger.paths[operation.path]
    const firstMethod = Object.keys(path)[0];
    const tag = path[firstMethod].tags[0];
    const resourceApi = `${tag.replace(/\s+/g, "")}Api`; // Remove all spaces

    if (resourceApi === "Api") {
      throw new Error("Unable to find resource's api");
    }

    const proxyData: ProxyData = {
      ...Generator.parentObject,
      api: resourceApi,
      apiCamel: pascalToCamel(resourceApi),
    };
    this.getMethodNames(proxyData);

    this.templateGenerator.generate("proxy", proxyData, true);
    console.info(`Created proxy file for ${Generator.config.package}`);
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
