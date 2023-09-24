# Genesys TF resource generator

This tool can be used to generate terraform resources for Genesys Cloud. This project is created using Typescript and handlebars template files that can help generate the code needed for a Genesys Cloud terraform resource. While every attempt was made to make this tool as robust as possible, not all resources are the same and some are entirely unique and unpredictable. In these rare situations the resource generator will not be able to generate an entire resource but should be able to help generate some boilerplate code and help get you started.

## Getting started

You will first need to run the following command to install all dependencies:

```bash
npm install
```

To generate a resource simply fill in all the information for the resource you are creating into the a YAML config file. The YAML config file will dictate everything that is generated. For more info on writing the YAML config file see [here](#yaml-configuration-file) for details. Before you try to generate a resource it is first highly recommended that you run this command:

```bash
npm start --config=example.yml --resource
```

This command will generate a JSON representation of the resource which can help you find potential problems or unwanted properties in the resource. The JSON object will be written to a file named `data.json`. Once your config file is written, and you are happy with the resource object, run the following command:

```bash
npm start --config=example.yml
```

If the config flag is not used, the generator will look for a file named `config.yml`. For the best results, we recommend having _Go_ installed locally to allow the output files to be formatted correctly. Go can be installed from [here](https://go.dev/dl/).
Every time the start command is run, without the `--resource` flag, the output folder for the resource is overwritten.
Similarly every time the start command is run with `--resource`, the data.json is overwritten

The resource generator can generate the following:

- Some or all resource files with all necessary logic
- A skeleton structure for some or all files
- Skeleton test files (init test, resource test and data source test)
- Documentation files

The resource generator also allows you to ignore properties that belong to the Swagger object.

## Tips and tricks

Before you generate a resource, always use the `--resource` and check the resulting object to check for any unexpected data that may appear in the resource.

The resource generator is able to handle the most common property types, but there will be times it won't be able to handle a property. If a property is causing an error when generating a resource, we recommend ignoring the property and then filling in the required logic to handle it manually. See [here](#ignore-properties) for info on ignoring properties

The following properties will be ignored by default if they belong to the main object or any nested objects:

- id
- selfUri
- version
- dateCreated
- dateModified

All info you need for a defining a resource can be found on the [Genesys Developer Center's API explorer](https://developer.genesys.cloud/devapps/api-explorer).

If you wish to view the main object or paths in the swagger docs, the public swagger can be downloaded from [here](https://api.mypurecloud.com/api/v2/docs/swagger). (Firefox formats this file very well)

The generator has no concept for what is "right" and simple generates content according to templates. Do not expect the resulting files to be perfect and always make sure to review the outputted content for erros or bugs.  

After generating a resource there will still be somethings that you need to do, such as:

- Writing the tests
- Adding dependencies to the init_test file
- Reviewing the code
- Adding the package to the terraform-provder 

## YAML Configuration file

Config File Main properties:

- package: The package name for the resource. This name will also be used for the name of the resource and in the resource's file names. **Required** property.
- mainObject: The object used by the APIs. Must be listed as a definition in the public swagger doc. **Required** property
- operations: An array of objects with info for each operation the resource can perform. Order does not matter. Each operation must use a valid path that is listed in the public swagger doc. **Recommended**. Excluding this property will result in skeleton structure being generated.

These 3 properties are potentially the only properties needed to create a full resource,

### Full resource config

Below is an example of a config that could be used to generate a full resource. In this case it will generate a resource for outbound callabletimesets:

```yaml
package: outbound_callabletimeset
mainObject: CallableTimeSet
operations:
  - type: create
    method: POST
    path: /api/v2/outbound/callabletimesets
  - type: read
    method: GET
    path: /api/v2/outbound/callabletimesets/{callableTimeSetId}
  - type: update
    method: PUT
    path: /api/v2/outbound/callabletimesets/{callableTimeSetId}
  - type: delete
    method: DELETE
    path: /api/v2/outbound/callabletimesets/{callableTimeSetId}
  - type: getAll
    method: GET
    path: /api/v2/outbound/callabletimesets
```

If you wish to exclude a file from the generation process add any of the following to the config:

```yaml
noSchemaFile: true
noResourceFile: true
noProxyFile: true
noDataSourceFile: true
noUtilsFile: true
```

### Skeleton files

To create a skeleton structure for a resource you can add the following to the config file:

```yaml
skeleton: true
```

This will created all files and functions needed for the resource but containing no programmatic logic. Alternatively you can leave the operations property out of the config file. This method is not recommended as it will result in a very minimal proxy file and functions being created that may not be needed.

If you wish to only generate certain skeleton files add any of the following to your config.

```yaml
skeletonSchemaFile: true
skeletonResourceFile: true
skeletonProxyFile: true
skeletonDataSourceFile: true
```

All other files will be created as normal unless explicitly excluded. It is also not possible to generate a sleleton utils file and if `skeltonResourceFile` is used, no utils file is created.

### Utils file

The utils file is used an extension of the resource file and contains helper functions used when performing CRUD operation on a resource.If the resource you are generating does not contain any nested resources, a utils file is not created.  If no utils file is generated the content of the utils file will be added to the resource file. If you add `noResourceFile` or `skeletonResourceFile` to your config, no utils file will be generated.

### Test files

To generate skeleton test files, add the following to the config.yml:

```yaml
testFiles: true # Generate resource and data source test files
initTest: true # Generate init test file
```

The resource generator will only create **boilerplate test files**, they will contain no logic.

### Documentation

To tell the resource generator to generate documentation, simply add the following to your config file.

```yaml
documentation: true
```

When generating documentation it is recommended to add a link property to each operations object. The link will be a link to the endpoint on th API explorer.

```yaml
operations:
  - type: create
    method: POST
    path: /api/v2/outbound/callabletimesets
    link: https://developer.genesys.cloud/devapps/api-explorer#post-api-v2-outbound-callabletimesets
```

If generating documentation, the resource generator will generate the following folder:

- examples
  - resources
    - resource.tf
    - apis.md
  - data-sources
    - data-source.tf

Please note that `resource.tf` and `data-source.tf` will be **blank files** and will require you to fill in the content. `api.md` will only be created if links have been added to the operations

### Ignore properties

If you wish to ignore properties that are part of the main object or any nested objects add the following to the config:

```yaml
ignoreProperties:
  - propertyName1
  - propertyName2
```

Please note that all properties with that name will not used by the resource.

For example, responsemanagement libraries has a deprecated property `responseType` that we don't want in the resource. To ignore it we write:

```yaml
ignoreProperties:
  - responseType
```

## Project Limitations and need to knows

- Object Array properties are defined as lists in the schema. Nested object properties are defined as lists with `MaxItems=1`
- All data sources will use the name property

The resource generator is a best attempt to automate the generation of Genesys cloud resources but like most things it is not perfect and will not be able to generate all resources. Even in the cases where the resource generator generates everything it can, there will likely be some changes that have to be made for the resource to be used. Always make sure to review the outputted content for erros or bugs.  

If you wish to make a contribution to the generator, PR are very welcome.
