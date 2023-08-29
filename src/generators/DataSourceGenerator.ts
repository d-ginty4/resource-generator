import { Generator } from "./Generator";

export class DataSourceGenerator extends Generator {
  template: string;
  outputLocation: string;

  constructor() {
    super();
    this.template = "src/templates/dataSource.mustache";
    this.outputLocation = `output/${this.config.package}/dataSource.go`;
  }

  public generate() {
    const dataSourceData = {};

    this.generateFile(this.template, dataSourceData, this.outputLocation);
  }
}
