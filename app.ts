import fs from "fs";
import * as yaml from "js-yaml";
import { Config } from "./types/Config";
import { Generator } from "./generators/generator";
import { Swagger } from "./types/Swagger";

const config = readConfig();
const swagger = readSwagger()

const generator = new Generator(config, swagger)
generator.generateResource()

// TODO: throw error if config is wrong
function readConfig(): Config {
  const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
  const data: Config = yaml.load(yamlFileContent) as Config;
  return data;
}

// TODO: throw error if swagger is wrong?
function readSwagger() {
  const jsonFileContent = fs.readFileSync("swagger.json", "utf-8");
  const jsonData: Swagger = JSON.parse(jsonFileContent) as Swagger;
  return jsonData
}

function updateSwagger(){
    
}