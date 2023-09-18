import * as handlebars from "handlebars";

handlebars.registerHelper("eq", function (a, b) {
  return a === b;
});

export default handlebars;
