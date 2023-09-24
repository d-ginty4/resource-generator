import * as handlebars from "handlebars";
import * as fs from "fs";
import templates from "./templates";

// Check equality
handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

// exampleName => ExampleName
handlebars.registerHelper("pascal", function (text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
});

// exampleName => example_name
handlebars.registerHelper("snake", function (text: string) {
  return text.replace(/[A-Z]/g, (letter: string) => `_${letter.toLowerCase()}`);
});

// exampleName => Examplename
handlebars.registerHelper("sdk", function (text: string) {
  const lowerCase = text.toLowerCase();
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
});

// exampleName => Example Name
handlebars.registerHelper("english", function (text: string) {
  // Split the string by capital letters
  const words: string[] = text.split(/(?=[A-Z])/);

  // Capitalize the first word and join the rest with spaces
  const englishText = words
    .map((word, index) => (index === 0 ? word : word.toLowerCase()))
    .join(" ");

  return englishText;
});

const schemaProperty = fs.readFileSync(
  templates.get("schemaProperty")!,
  "utf8"
);
handlebars.registerPartial("schemaProperty", schemaProperty);

const resourceData = fs.readFileSync(
  templates.get("resourceData")!,
  "utf8"
);
handlebars.registerPartial("resourceData", resourceData);

export default handlebars;
