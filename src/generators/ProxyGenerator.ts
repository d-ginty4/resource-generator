import { camelToPascal, pascalToCamel } from "../utils/variableRenames";
import { Generator } from "./Generator";

interface ProxyData {
  [key: string]: string;
}

export class ProxyGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = "src/templates/proxy/proxy.mustache";
    this.outputLocation = `output/${this.config.package}/genesyscloud_${this.globalData.snakeName}_proxy.go`;
  }

  public generate() {
    const getOperation = this.config.operations.find(
      (operation) => operation.type === "read"
    ) || { path: "" };
    const proxyData: ProxyData = {
      api: `${this.swagger.paths[getOperation.path].get.tags[0]}Api`,
    };
    proxyData.apiCamel = pascalToCamel(proxyData.api);
    
    this.getMethodNames(proxyData);
    this.generateFile(this.template, this.outputLocation, proxyData);
  }

  private getMethodNames(proxyData: ProxyData) {
    for (const operation of this.config.operations) {
      const methodName =
        this.swagger.paths[operation.path][operation.method.toLowerCase()].operationId;
      proxyData[`${operation.type}Method`] = camelToPascal(methodName);
    }
  }
}
