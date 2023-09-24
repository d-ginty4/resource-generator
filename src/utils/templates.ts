const templates = new Map<string, string>();

// schema templates
templates.set("schema", "src/templates/schema/schema.hbs");
templates.set("schemaProperty", "src/templates/schema/schemaProperty.hbs");
templates.set("nestedSchema", "src/templates/schema/nestedSchema.hbs");

// proxy templates
templates.set("proxy", "src/templates/proxy/proxy.hbs");

// resource templates
templates.set("resource", "src/templates/resource/resource.hbs");

// utils templates
templates.set("utils", "src/templates/utils/utils.hbs");
templates.set("resourceData", "src/templates/utils/resourceData.hbs");
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
templates.set("apis", "src/templates/docs/apis.hbs");

export default templates;
