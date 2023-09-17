// import { SwaggerSchema, SwaggerSchemaProperty } from "../types/Swagger";
// import {
//   camelToPascal,
//   camelToSnake,
//   goSdkName,
//   pascalToCamel,
// } from "../utils/variableRenames";
// import { Generator } from "./Generator";
// import { TemplateGenerator } from "./TemplateGenerator";

// interface NestedData {
//   objectPascal: string;
//   objectCamel: string;
//   objectGoSDK: string;
// }

// interface NestedObjectPropertyData {
//   objectName: string;
//   property: string;
//   objectProperty: string;
//   nestedObjectFunc?: string;
//   type?: string;
//   objectPascalName?: string;
// }

// export class UtilsGenerator extends Generator {
//   templateGenerator: TemplateGenerator;

//   constructor() {
//     super();
//     this.templateGenerator = new TemplateGenerator();
//   }

//   // generate utils file
//   public generate() {
//     this.templateGenerator = new TemplateGenerator();
//     const utilsData = {
//       resourceDataFunc: this.generateResourceDataFunc(),
//       nestedObjects: this.handleNestedObjects(),
//     };

//     this.templateGenerator.generate("utils", utilsData);
//   }

//   private generateResourceDataFunc(): string {
//     const resourceDataFuncData = {
//       pascalName: Generator.globalData.pascalName,
//       mainObjectGoSDK: Generator.globalData.mainObjectGoSDK,
//       basicProperties: this.generateBasicProperties(),
//       complexProperties: this.generateComplexProperties(),
//     };
//     return this.templateGenerator.generate(
//       "createResourceData",
//       resourceDataFuncData,
//       false
//     )!;
//   }

//   private generateBasicProperties(): object[] {
//     const basicProperties: object[] = [];

//     for (const [name, property] of Object.entries(
//       Generator.swagger.definitions[Generator.config.mainObject].properties!
//     )) {
//       if (this.isIgnorableProperty(name)) {
//         continue;
//       }
//       if (this.evaluatePropertyType(name, property) === "basic type") {
//         basicProperties.push({
//           propertyCamel: name,
//           propertySnake: camelToSnake(name),
//           propertyPascal: camelToPascal(name),
//           type: property.type,
//         });
//       }
//     }
//     return basicProperties;
//   }

//   private generateComplexProperties(): string[] {
//     const complexProperties: string[] = [];

//     for (const [name, property] of Object.entries(
//       Generator.swagger.definitions[Generator.config.mainObject].properties!
//     )) {
//       if (this.isIgnorableProperty(name)) {
//         continue;
//       }
//       if (this.evaluatePropertyType(name, property) === "nested object") {
//         complexProperties.push(
//           `build${camelToPascal(name)}(d.Get("${camelToSnake(
//             name
//           )}").(interface{}))`
//         );
//       }
//       if (
//         this.evaluatePropertyType(name, property) === "nested objects array"
//       ) {
//         complexProperties.push(
//           `build${camelToPascal(name)}s(d.Get("${camelToSnake(
//             name
//           )}").([]interface{}))`
//         );
//       }
//     }

//     return complexProperties;
//   }

//   // creates a build and flatten function for each nested object
//   private handleNestedObjects(): string[] {
//     const nestedObjectFunctions: string[] = [];

//     for (const nestedObjectName of Generator.nestedObjects) {
//       console.info(`Creating util functions for ${nestedObjectName}`);
//       const nestedObject = Generator.swagger.definitions[nestedObjectName];
//       if (!nestedObject) {
//         throw new Error(
//           `The nested object ${nestedObjectName} does not exist in the swagger file`
//         );
//       }

//       const nestedObjectData = {
//         objectPascal: nestedObjectName,
//         objectCamel: pascalToCamel(nestedObjectName),
//         objectGoSDK: goSdkName(nestedObjectName),
//       };

//       console.info(`Creating build function for ${nestedObjectName}`);
//       nestedObjectFunctions.push(
//         this.generateBuildFunction(nestedObject, nestedObjectData)
//       );

//       console.info(`Creating flatten function for ${nestedObjectName}`);
//       nestedObjectFunctions.push(
//         this.generateFlattenFunction(nestedObject, nestedObjectData)
//       );
//       console.log(`Created util functions for ${nestedObjectName}`);
//     }

//     return nestedObjectFunctions;
//   }

//   // generates a build function for a nested object
//   private generateBuildFunction(
//     nestedObject: SwaggerSchema,
//     objectData: NestedData
//   ): string {
//     const buildProperties: string[] = [];
//     const that = this;

//     function generateBuildProperty(
//       name: string,
//       property: SwaggerSchemaProperty
//     ): string {
//       const buildPropertyData: NestedObjectPropertyData = {
//         objectName: objectData.objectCamel,
//         objectPascalName: objectData.objectPascal,
//         property: camelToSnake(name),
//         objectProperty: camelToPascal(name),
//       };

//       switch (that.evaluatePropertyType(name, property)) {
//         case "basic type":
//           buildPropertyData.type = property.type!;
//           break;
//         case "nested object":
//           if (property.items?.$ref) {
//             buildPropertyData.type = "nested object";
//             buildPropertyData.nestedObjectFunc = `build${
//               property.items.$ref.split("/")[2]
//             }`;
//           }
//           break;
//         case "string array":
//           break;
//         case "nested object array":
//           if (property.items?.$ref) {
//             buildPropertyData.type = "nested object array";
//             buildPropertyData.nestedObjectFunc = `build${
//               property.items.$ref.split("/")[2]
//             }s`;
//           }
//           break;
//         default:
//           throw new Error(`Unable to handle property ${name}: ${property}`);
//       }
//       return that.templateGenerator.generate(
//         "buildProperty",
//         buildPropertyData,
//         false
//       )!;
//     }

//     if (nestedObject.properties) {
//       for (const [name, property] of Object.entries(nestedObject.properties)) {
//         if (this.isIgnorableProperty(name)) {
//           continue;
//         }
//         buildProperties.push(generateBuildProperty(name, property));
//       }
//     }
//     return this.templateGenerator.generate(
//       "buildFunction",
//       {
//         ...objectData,
//         buildProperties: buildProperties,
//       },
//       false
//     )!;
//   }

//   // generates a flatten function for a nested object
//   private generateFlattenFunction(
//     nestedObject: SwaggerSchema,
//     objectData: NestedData
//   ): string {
//     const flattenProperties: string[] = [];
//     const that = this;

//     // generates a flatten statement for a property
//     function generateFlattenProperty(
//       name: string,
//       property: SwaggerSchemaProperty
//     ): string {
//       const flattenPropertyData: NestedObjectPropertyData = {
//         objectName: objectData.objectCamel,
//         property: camelToSnake(name),
//         objectProperty: camelToPascal(name),
//       };

//       switch (that.evaluatePropertyType(name, property)) {
//         case "basic type":
//           break;
//         case "nested object":
//           if (property.items?.$ref) {
//             const nestedObjectName = property.items.$ref.split("/")[2];
//             flattenPropertyData.nestedObjectFunc = `flatten${nestedObjectName}`;
//           }
//           break;
//         case "string array":
//           break;
//         case "nested object array":
//           if (property.items?.$ref) {
//             const nestedObjectName = property.items.$ref.split("/")[2];
//             flattenPropertyData.nestedObjectFunc = `flatten${nestedObjectName}s`;
//           }
//           break;
//         default:
//           throw new Error(`Unable to handle property ${name}: ${property}`);
//       }

//       return that.templateGenerator.generate(
//         "flattenProperty",
//         flattenPropertyData,
//         false
//       )!;
//     }

//     if (nestedObject.properties) {
//       for (const [name, property] of Object.entries(nestedObject.properties)) {
//         if (this.isIgnorableProperty(name)) {
//           continue;
//         }
//         flattenProperties.push(generateFlattenProperty(name, property));
//       }
//     }

//     return this.templateGenerator.generate(
//       "flattenFunction",
//       {
//         ...objectData,
//         flattenProperties: flattenProperties,
//       },
//       false
//     )!;
//   }
// }
