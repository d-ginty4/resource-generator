import fs from "fs";
import mustache from "mustache";
import * as yaml from "js-yaml";
import { Config } from "./Config"

const config = parseConfig()
console.log(config)

// Parse the yaml config file 
function parseConfig(): Config{
    const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
    const data: Config = yaml.load(yamlFileContent) as Config;
    return data
}