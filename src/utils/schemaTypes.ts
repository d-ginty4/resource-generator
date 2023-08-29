const schemaTypes = new Map<string, string>();

schemaTypes.set("string", "schema.TypeString");
schemaTypes.set("integer", "schema.TypeInt");
schemaTypes.set("array", "schema.TypeList");

export default schemaTypes;
