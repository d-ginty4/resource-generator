import Resource from "../classes/Resource";
import { Generator } from "./Generator";
import { TemplateGenerator } from "./TemplateGenerator";

class UtilsGenerator extends Generator {
  templateGenerator: TemplateGenerator;

  constructor() {
    super();
    this.templateGenerator = new TemplateGenerator();
  }

  // generate utils file
  public generate() {
    const { buildFuncs, flattenFuncs } = this.generateFunctions();

    this.templateGenerator.generate(
      "utils",
      {
        ...Generator.parentObject,
        flattenFuncs: flattenFuncs,
        buildFuncs: buildFuncs,
      },
      true
    );
  }

  public generateFunctions(): { buildFuncs: string[]; flattenFuncs: string[] } {
    let flattenFuncs: string[] = [];
    let buildFuncs: string[] = [];
    Generator.parentObject.getProperties().forEach((property) => {
      if (property.getNestedObject()) {
        flattenFuncs = this.generateFlattenFunctions(
          property.getNestedObject()?.getName()!,
          property.getNestedObject()!,
          flattenFuncs
        );
        buildFuncs = this.generateBuildFunctions(
          property.getNestedObject()?.getName()!,
          property.getNestedObject()!,
          buildFuncs
        );
      }
    });

    return { flattenFuncs, buildFuncs };
  }

  private generateBuildFunctions(
    objName: string,
    objData: Resource,
    functions: string[]
  ): string[] {
    functions.push(
      this.templateGenerator.generate("buildFunction", {
        object: objName,
        buildProperties: this.generateBuildProperties(
          objName,
          objData,
          functions
        ),
      })!
    );
    return functions;
  }

  private generateBuildProperties(
    objName: string,
    objData: Resource,
    functions: string[]
  ): string[] {
    const buildProperties: string[] = [];

    objData.getProperties().forEach((property) => {
      buildProperties.push(
        this.templateGenerator.generate("buildProperty", {
          ...property,
          object: objName
        })!
      );
      if (property.getNestedObject()) {
        functions = this.generateBuildFunctions(
          property.getNestedObject()?.getName()!,
          property.getNestedObject()!,
          functions
        );
      }
    });

    return buildProperties;
  }

  private generateFlattenFunctions(
    objName: string,
    objData: Resource,
    functions: string[]
  ): string[] {
    functions.push(
      this.templateGenerator.generate("flattenFunction", {
        object: objName,
        flattenProperties: this.generateFlattenProperties(
          objName,
          objData,
          functions
        ),
      })!
    );
    return functions;
  }

  private generateFlattenProperties(
    objName: string,
    objData: Resource,
    functions: string[]
  ): string[] {
    const flattenProperties: string[] = [];

    objData.getProperties().forEach((property) => {
      flattenProperties.push(
        this.templateGenerator.generate("flattenProperty", {
          ...property,
          object: objName,
        })!
      );
      if (property.getNestedObject()) {
        functions = this.generateFlattenFunctions(
          property.getNestedObject()?.getName()!,
          property.getNestedObject()!,
          functions
        );
      }
    });

    return flattenProperties;
  }
}

export default new UtilsGenerator();
