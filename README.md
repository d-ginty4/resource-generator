# Genesys TF resource generator

This is a tool to generate terraform resources for Genesys Cloud. This project is created using Typescript and handlebars template files that can help generate the code needed for a Genesys Cloud terraform resource. While every attempt was made to make this tool as robust as possible, not all resources are the same and some are entirely unique and unpredictable. In these rare situations the resource generator will not be able to generate an entire resource but will be able to help generate some boilerplate code and help get you started.

## Getting started
To generate a resource simply fill in all the information for the resource you are creating into the `config.yml` file. For more info on writing the config.yml file see [here]() for details. Once your config.yml file is written, run the following command:
```bash
npm start
```
For the best results, I recommend having *Go* installed locally to allow the output files to be formatted correctly. Go can be installed from [here](https://go.dev/dl/).

## Configuration file
The content of the `config.yml` will dictate how much or how little code is generated. This resource generator is able to create:
  * A full resource (all files with necessary logic)
  * A skeleton structure for a resource(all files created with most functions and no logic)
  * Skeleton structure test files
  * Documentation

### Full resource config
```yaml
package: outbound_callabletimeset
mainObject: CallableTimeSet
operations:
  - type: create
    method: POST
    path: /api/v2/outbound/callabletimesets
    link: https://developer.genesys.cloud/devapps/api-explorer#post-api-v2-outbound-callabletimesets
  - type: read
    method: GET
    path: /api/v2/outbound/callabletimesets/{callableTimeSetId}
    link: https://developer.genesys.cloud/devapps/api-explorer#get-api-v2-outbound-callabletimesets--callableTimeSetId-
  - type: update 
    method: PUT
    path: /api/v2/outbound/callabletimesets/{callableTimeSetId}
    link: https://developer.genesys.cloud/devapps/api-explorer#post-api-v2-outbound-callabletimesets
  - type: delete
    method: DELETE
    path: /api/v2/outbound/callabletimesets/{callableTimeSetId}
    link: https://developer.genesys.cloud/devapps/api-explorer#delete-api-v2-outbound-callabletimesets--callableTimeSetId-
  - type: getAll
    method: GET
    path: /api/v2/outbound/callabletimesets
    link: https://developer.genesys.cloud/devapps/api-explorer#get-api-v2-outbound-callabletimesets
testFiles: false
documentation: false
```

### Skeleton structure
```yaml
package: outbound_callabletimeset
mainObject: CallableTimeSet
```
## Project Limitations and need to knows
* If the resource contains ant nested resources, a utils file will be created
* Array values are created as lists