import { Swagger } from "../types/Swagger";
import * as fs from "fs";

export default function readSwagger(): Swagger {
    const jsonFileContent = fs.readFileSync("swagger.json", "utf-8");
    const jsonData: Swagger = JSON.parse(jsonFileContent) as Swagger;
    return jsonData;
}