# Genesys TF resource generator

## Full config

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