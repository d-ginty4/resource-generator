import templates from "../utils/templates";
import { camelToPascal, pascalToCamel } from "../utils/variableRenames";
import { Generator } from "./Generator";

interface ProxyData {
  api: string; // e.g. OutboundApi
  apiCamel: string; // e.g. outboundApi
  [method: string]: string; // e.g. readMethod: GetOutboundCallabletimeset
}

export class ProxyGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = templates.get("proxy")!;
    this.outputLocation = this.getOutputLocation("proxy")
  }

  // generates the proxy file
  public generate() {
    console.info(`Creating proxy file for ${Generator.globalData.englishName}`);
    // find the get/read operation
    const getOperation = Generator.config.operations.find(
      (operation) => operation.type === "read"
    ) || { path: "" };

    // find the go sdk api class name e.g. OutboundApi
    const resourceApi = `${
      Generator.swagger.paths[getOperation.path].get.tags[0]
    }Api`;

    if (resourceApi === "Api") {
      throw new Error("Unable to find resource's api");
    }

    const proxyData: ProxyData = {
      api: resourceApi,
      apiCamel:pascalToCamel(resourceApi),
    };
    this.getMethodNames(proxyData);

    this.generateFile(this.template, this.outputLocation, proxyData);
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
