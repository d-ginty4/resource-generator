import ObjectData from "../classes/ObjectData";
import { goSdkName, pascalToCamel } from "../utils/variableRenames";
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
    let flattenFuncs: string[] = [];
    let buildFuncs: string[] = [];
    Generator.parentObject.getProperties().forEach((property) => {
      if (property.getNestedObject()) {
        flattenFuncs = this.generateFlattenFunctions(
          property.getNestedObject()?.objectName!,
          property.getNestedObject()?.objectData!,
          flattenFuncs
        );
        buildFuncs = this.generateBuildFunctions(
          property.getNestedObject()?.objectName!,
          property.getNestedObject()?.objectData!,
          buildFuncs
        );
      }
    });
    this.templateGenerator.generate(
      "utils",
      {
        resourceDataFunc: this.templateGenerator.generate(
          "createResourceData",
          Generator.parentObject
        ),
        flattenFuncs: flattenFuncs,
        buildFuncs: buildFuncs,
      },
      true
    );
  }

  private generateBuildFunctions(
    objName: string,
    objData: ObjectData,
    functions: string[]
  ): string[] {
    functions.push(
      this.templateGenerator.generate("buildFunction", {
        objectPascal: objName,
        objectCamel: pascalToCamel(objName),
        objectGoSdk: goSdkName(objName),
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
    objData: ObjectData,
    functions: string[]
  ): string[] {
    const buildProperties: string[] = [];

    objData.getProperties().forEach((property) => {
      buildProperties.push(
        this.templateGenerator.generate("buildProperty", {
          ...property,
          objectName: pascalToCamel(objName),
          objectPascalName: objName
        })!
      );
      if (property.getNestedObject()) {
        functions = this.generateBuildFunctions(
          property.getNestedObject()!.objectName,
          property.getNestedObject()!.objectData,
          functions
        );
      }
    });

    return buildProperties;
  }

  private generateFlattenFunctions(
    objName: string,
    objData: ObjectData,
    functions: string[]
  ): string[] {
    functions.push(
      this.templateGenerator.generate("flattenFunction", {
        objectPascal: objName,
        objectCamel: pascalToCamel(objName),
        objectGoSdk: goSdkName(objName),
        flattenProperties: this.generateFlattenProperties(
          pascalToCamel(objName),
          objData,
          functions
        ),
      })!
    );
    return functions;
  }

  private generateFlattenProperties(
    objName: string,
    objData: ObjectData,
    functions: string[]
  ): string[] {
    const flattenProperties: string[] = [];

    objData.getProperties().forEach((property) => {
      flattenProperties.push(
        this.templateGenerator.generate("flattenProperty", {
          ...property,
          objectName: objName,
        })!
      );
      if (property.getNestedObject()) {
        functions = this.generateFlattenFunctions(
          property.getNestedObject()!.objectName,
          property.getNestedObject()!.objectData,
          functions
        );
      }
    });

    return flattenProperties;
  }
}

export default new UtilsGenerator();
