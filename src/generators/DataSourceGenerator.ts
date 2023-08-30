import { Generator } from "./Generator";

export class DataSourceGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = "src/templates/dataSource/dataSource.mustache";
    this.outputLocation = `output/${this.config.package}/data_source_genesyscloud_${this.globalData.snakeName}.go`;
  }

  public generate() {
    this.generateFile(this.template, this.outputLocation);
  }
}
