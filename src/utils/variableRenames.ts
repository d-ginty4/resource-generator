export function snakeToPascal(snakeCase: string): string {
  return snakeCase
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}

export function snakeToCamel(input: string): string {
  return input.replace(/(_\w)/g, match => match[1].toUpperCase());
}

export function snakeToEnglish(snakeCase: string): string {
  return snakeCase
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function camelToPascal(camelCaseString: string): string {
  return camelCaseString.charAt(0).toUpperCase() + camelCaseString.slice(1);
}

export function pascalToCamel(pascalCaseString: string): string {
  return pascalCaseString.charAt(0).toLowerCase() + pascalCaseString.slice(1);
}

export function goSdkName(name: string): string {
  const lowerCase = name.toLowerCase();
  return lowerCase.charAt(0).toUpperCase() + lowerCase.slice(1);
}

export function camelToSnake(camelCaseString: string): string {
  return camelCaseString.replace(
    /[A-Z]/g,
    (letter) => `_${letter.toLowerCase()}`
  );
}
