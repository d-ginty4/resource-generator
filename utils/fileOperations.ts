import mustache from "mustache";
import fs from "fs";

/**
 * Generate a file using a template and data
 * @param template file template location
 * @param data the data to be used by the template
 * @param destination the destination of the output file
 */
export function generateFile(
  template: string,
  data: object,
  destination: string
) {
  const templateText = fs.readFileSync(template, "utf-8");

  // generate the resource test file from the template and data
  const output = mustache.render(templateText, data);

  // Save the generated output to a file
  fs.writeFileSync(destination, output, "utf-8");
}
