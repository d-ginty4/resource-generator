import { Config } from "../types/Config";
import { Swagger } from "../types/Swagger";

export class ProxyGenerator {
  private config: Config;
  private swagger: Swagger;

  constructor(config: Config, swagger: Swagger) {
    this.config = config;
    this.swagger = swagger;
  }

  public generate() {}
}
