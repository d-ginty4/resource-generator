# Genesys TF resource generator

This tool can be used to generate terraform resources for Genesys Cloud. This project is created using Typescript and handlebars template files that can help generate the code needed for a Genesys Cloud terraform resource. While every attempt was made to make this tool as robust as possible, not all resources are the same and some are entirely unique and unpredictable. In these rare situations the resource generator will not be able to generate an entire resource but should be able to help generate some boilerplate code and help get you started.

## Getting started
You will first need to run the following command to install all dependencies:
```bash
npm install
```
To generate a resource simply fill in all the information for the resource you are creating into the `config.yml` file. For more info on writing the config.yml file see [here](#configuration-file) for details. Once your config.yml file is written, run the following command:
```bash
npm start
```
For the best results, we recommend having *Go* installed locally to allow the output files to be formatted correctly. Go can be installed from [here](https://go.dev/dl/).

## Configuration file
The content of the `config.yml` will dictate how much or how little code is generated. This resource generator is able to create:
  * A full resource (all files with necessary logic)
  * A skeleton structure for a resource (all files created with most functions and no logic)
  * Test files (init test, resource test and data source test files)

Config File properties:
  * package: The package name for the resource. This name is also be used for the name of the resource and in the resource file names.
  * mainObject: The object used by the APIs. Must be listed as a definition in the public swagger doc.
  * operations: An array of objects with info for each operation the resource can perform. Order does not matter. Each operation must use a valid path that is listed in the public swagger doc.

### Full resource config
Below is an example of a config file that could be used to generate a full resource. In this case it will generate a resource for outbound callabletimesets:

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

### Skeleton structure
To create a skeleton structure (boilerplate) for a resource, simple leave the operations property out of the config. The schema file will be the same as for a full resource

```yaml
package: outbound_callabletimeset
mainObject: CallableTimeSet
```

### Test files
To generate a skeleton test files, add the following to the config.yml:
```yaml
testFiles: true # Generate resource and data source test files
initTest: true # Generate init test file 
```
The resource generator will only create **boilerplate test files**, they will contain no logic.  

## Generation Controllers
### Ignore property
If you wish to ignore a property or properties that is/are part of the main object or any nested objects add the following to the config:
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

### Skeleton files
If you wish you create a full resource but with a some skeleton files, you can add any of the following to the config.yml:
```yaml
skeletonSchemaFile: true;
skeletonResourceFile: true;
skeletonProxyFile: true;
skeletonDataSourceFile: true;
```
If only creating a skeleton file, you will still need to include the operations.

## Project Limitations and need to knows
* The resource must preform all 5 operation on a resource i.e. create, read, update, destroy and get all
* A utils file will always be created and a `getXFromResourceData` function will always be created and used by the create and update functions
* If more that one object is used by the APIs, e.g. `Categorycreaterequest` for POST and `Categoryupdaterequest` for PUT, then the resource generator can't be used
* Object Array properties are defined as lists in the schema. Nested object properties are defined as lists with MaxItems=1
* All data sources will use the name property