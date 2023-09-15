const templates = new Map<string, string>();

// schema templates
templates.set("schema", "src/templates/schema/schema.hbs")
templates.set("schemaProperty", "src/templates/schema/schemaProperty.hbs")
templates.set("nestedSchema", "src/templates/schema/nestedSchema.hbs")

// proxy templates
templates.set("proxy", "src/templates/proxy/proxy.hbs")

// resource templates
templates.set("resource", "src/templates/resource/resource.hbs")
templates.set("readProperty", "src/templates/resource/readProperty.hbs")

// utils templates
templates.set("utils", "src/templates/utils/utils.hbs");
templates.set(
  "createResourceData",
  "src/templates/utils/createResourceData.hbs"
);
templates.set("buildFunction", "src/templates/utils/buildFunction.hbs");
templates.set("buildProperty", "src/templates/utils/buildProperty.hbs");
templates.set("flattenFunction", "src/templates/utils/flattenFunction.hbs");
templates.set("flattenProperty", "src/templates/utils/flattenProperty.hbs");

// dataSource templates
templates.set("dataSource", "src/templates/dataSource/dataSource.hbs");

// test templates
templates.set("resourceTest", "src/templates/tests/resourceTest.hbs");
templates.set("dataSourceTest", "src/templates/tests/dataSourceTest.hbs");
templates.set("initTest", "src/templates/tests/initTest.hbs");

// documentation templates

export default templates;