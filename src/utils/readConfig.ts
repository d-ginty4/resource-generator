import * as yaml from "js-yaml";
import * as fs from "fs";
import { Config } from "../types/Config";

export default function readConfig(): Config {
  const yamlFileContent = fs.readFileSync("config.yml", "utf-8");
  const data: Config = yaml.load(yamlFileContent) as Config;
  return data;
}
