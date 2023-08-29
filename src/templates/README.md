# Tag meanings

A lot of different tags are used in the template files, some of which might be confusing. I have documented the most used tags here.

| Tag             | Description                                                                                                              |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| snakeName       | The snake case name of the package. Read from the package field in the config                                    |
| camelName       | The camel case name of the package                                                                                       |
| pascalName      | The pascal case name of the package                                                                                      |
| englishName     | The english representation of the package name. Example: outbound_ruleset => Outbound Ruleset                            |
| mainObject      | The object used by the resources API's. Must be in the swagger definitions. Read from the rootObject field in the config |
| mainObjectCamel | Camel case representation of the main objects name                                                                       |
| mainObjectGoSDK | The name of the main object's struct in the go sdk                                                                       |
