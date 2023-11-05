import { Swagger } from "../types/Swagger";
import * as fs from "fs";
import childProcess from "child_process";

// To ensure the swagger is up to date and to avoid excessive re-downloading of the swagger
// we will add the current date to the swagger we're using, every time the project runs
// we will check if the date in the swagger is today's date, if it is we use it,
// if it is not then we download the swagger again.

const publicSwaggerPath = "https://api.mypurecloud.com/api/v2/docs/swagger";
const previewSwaggerPath =
  "https://api.mypurecloud.com/api/v2/docs/swaggerpreview";

export default function readSwagger(): Swagger {
  let jsonFileContent;
  try {
    jsonFileContent = fs.readFileSync("swagger.json", "utf-8");
  } catch (error) {
    jsonFileContent = "";
  }
  if (jsonFileContent === "") {
    return updateSwagger();
  }

  const swaggerData: Swagger = JSON.parse(jsonFileContent) as Swagger;

  // Check if we need to update swagger
  const currentDate: string = new Date().toDateString();
  if (currentDate !== swaggerData.dateDownloaded) {
    console.log("Updating Swagger File");
    return updateSwagger();
  } else return swaggerData;
}

function updateSwagger(): Swagger {
  // Download Public Swagger
  console.log(`Downloading public swagger from: ${publicSwaggerPath}`);
  const publicSwagger: Swagger = JSON.parse(downloadFile(publicSwaggerPath));

  // Download Preview Swagger
  console.log(`Downloading preview swagger from: ${previewSwaggerPath}`);
  const previewSwagger: Swagger = JSON.parse(downloadFile(previewSwaggerPath));

  // Combine Public and Preview swagger
  const fullSwagger: Swagger = combineSwagger(publicSwagger, previewSwagger);

  // Add current date to swagger
  fullSwagger.dateDownloaded = new Date().toDateString();

  // Write new swagger to swagger.json
  console.log("Writing new swagger content to swagger.json");
  try {
    fs.writeFileSync("swagger.json", JSON.stringify(fullSwagger));
    console.log("swagger.json updated successfully.");
  } catch (error) {
    throw new Error(`Error updating swagger.json: ${error}`);
  }

  return fullSwagger;
}

function downloadFile(url: string): string {
  var i = 0;
  while (i < 10) {
    i++;
    console.log(`Downloading file: ${url}`);
    // Source: https://www.npmjs.com/package/download-file-sync
    var file = childProcess.execFileSync("curl", ["--silent", "-L", url], {
      encoding: "utf8",
      maxBuffer: 1024 * 1024 * 1024,
    });
    if (!file || file === "") {
      console.log(
        `File was empty! sleeping for 5 seconds. Retries left: ${10 - i}`
      );
      childProcess.execFileSync(
        "curl",
        ["--silent", "https://httpbin.org/delay/10"],
        { encoding: "utf8" }
      );
    } else {
      return file;
    }
  }
  throw new Error(`Failed to download file ${url}`);
}

function combineSwagger(publicSwagger: Swagger, preview: Swagger): Swagger {
  console.log("Combining public and preview swagger docs into one");

  // Set new file equal to public file for now
  let newSwaggerFile = publicSwagger;

  // Search for tags that are in the preview swagger but not in the public swagger and add to new new JSON object
  preview.tags.forEach((previewTag) => {
    let duplicate = publicSwagger.tags.some(
      (publicTag) => publicTag.name === previewTag.name
    );
    if (!duplicate) {
      newSwaggerFile.tags.push(previewTag);
    }
  });

  // mark preview paths as preview(similar to marking as deprecated)
  for (const [key1, value1] of Object.entries(preview.paths)) {
    for (const [key, value] of Object.entries(value1)) {
      preview.paths[key1][key]["x-genesys-preview"] = true;
    }
  }

  // Search for paths in the preview swagger not in the public swagger(should be all paths) and add preview paths to new JSON object
  let previewPaths = Object.keys(preview.paths);
  let publicPaths = Object.keys(publicSwagger.paths);
  for (let i = 0; i < previewPaths.length; i++) {
    if (publicPaths.includes(previewPaths[i])) {
      // Path does exist in public swagger, add the preview HTTP method to the existing path in the new JSON object
      for (const [key, value] of Object.entries(
        preview.paths[previewPaths[i]]
      )) {
        newSwaggerFile.paths[previewPaths[i]][key] = value;
      }
    } else {
      // Path does not exist in public swagger, add the preview path to the new JSON objects paths
      newSwaggerFile.paths[previewPaths[i]] = preview.paths[previewPaths[i]];
    }
  }

  // Search for definitions in the preview swagger not in the public swagger and add preview definitions to new JSON object
  let previewDefinitions = Object.keys(preview.definitions);
  let publicDefinitions = Object.keys(publicSwagger.definitions);
  for (let i = 0; i < previewDefinitions.length; i++) {
    if (!publicDefinitions.includes(previewDefinitions[i])) {
      newSwaggerFile.definitions[previewDefinitions[i]] =
        preview.definitions[previewDefinitions[i]];
    }
  }

  return newSwaggerFile;
}
