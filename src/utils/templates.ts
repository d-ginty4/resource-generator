const templates = new Map<string, string>();

// schema templates
templates.set("schema", "src/templates/schema/schema.mustache")
templates.set("schemaProperty", "src/templates/schema/schemaProperty.mustache")
templates.set("nestedSchema", "src/templates/schema/nestedSchema.mustache")

// proxy templates
templates.set("proxy", "src/templates/proxy/proxy.mustache")

// resource templates
templates.set("resource", "src/templates/resource/resource.mustache")
templates.set("readProperty", "src/templates/resource/readProperty.mustache")

// utils templates
templates.set("utils", "src/templates/utils/utils.mustache");
templates.set("buildFunction", "src/templates/utils/buildFunction.mustache");
templates.set("buildProperty", "src/templates/utils/buildProperty.mustache");
templates.set("flattenFunction", "src/templates/utils/flattenFunction.mustache");
templates.set("flattenProperty", "src/templates/utils/flattenProperty.mustache");

// dataSource templates
templates.set("dataSource", "src/templates/dataSource/dataSource.mustache");

// test templates

// documentation templates

export default templates;