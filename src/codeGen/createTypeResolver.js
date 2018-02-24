import fs from "fs";
import path from "path";

export default function createGraphqlResolver(objectToCreate) {
  let template = fs.readFileSync(path.resolve(__dirname, "./resolverTemplate.js"), { encoding: "utf8" });
  let projectIdResolverTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdResolverTemplate.js"), { encoding: "utf8" });
  let projectIdsResolverTemplate = fs.readFileSync(path.resolve(__dirname, "./projectIdsResolverTemplate.js"), { encoding: "utf8" });

  let getItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/getItem.js"), { encoding: "utf8" });
  let allItemsTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/allItems.js"), { encoding: "utf8" });
  let createItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/createItem.js"), { encoding: "utf8" });
  let updateItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/updateItem.js"), { encoding: "utf8" });
  let updateItemsTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/updateItems.js"), { encoding: "utf8" });
  let updateItemsBulkTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/updateItemsBulk.js"), { encoding: "utf8" });
  let deleteItemTemplate = fs.readFileSync(path.resolve(__dirname, "./resolverTemplateMethods/deleteItem.js"), { encoding: "utf8" });

  let result = "";
  let imports = [
    `import { queryUtilities, processHook } from "mongo-graphql-starter";`,
    `import hooksObj from "../hooks";`,
    `const { decontructGraphqlQuery, parseRequestedFields, getMongoProjection, newObjectFromArgs, getUpdateObject, constants } = queryUtilities;`,
    `import { ObjectId } from "mongodb";`,
    `import ${objectToCreate.__name}Metadata from "./${objectToCreate.__name}";`,
    `import * as dbHelpers from "../dbHelpers";`
  ];
  let extras = objectToCreate.extras || {};
  let overrides = new Set(extras.overrides || []);

  let queryItems = [
    !overrides.has(`get${objectToCreate.typeName}`) ? getItemTemplate : "",
    !overrides.has(`all${objectToCreate.typeName}s`) ? allItemsTemplate : ""
  ]
    .filter(s => s)
    .join(",\n");

  let mutationItems = [
    !overrides.has(`create${objectToCreate.typeName}`) ? createItemTemplate : "",
    !overrides.has(`update${objectToCreate.typeName}`) ? updateItemTemplate : "",
    !overrides.has(`update${objectToCreate.typeName}s`) ? updateItemsTemplate : "",
    !overrides.has(`update${objectToCreate.typeName}sBulk`) ? updateItemsBulkTemplate : "",
    !overrides.has(`delete${objectToCreate.typeName}`) ? deleteItemTemplate : ""
  ]
    .filter(s => s)
    .join(",\n");

  let typeImports = new Set([]);
  let relationshipResolvers = "";

  if (objectToCreate.relationships) {
    Object.keys(objectToCreate.relationships).forEach((relationshipName, index, all) => {
      let relationship = objectToCreate.relationships[relationshipName];

      if (!typeImports.has(relationship.type.__name)) {
        typeImports.add(relationship.type.__name);
        imports.push(`import { load${relationship.type.__name}s} from "../${relationship.type.__name}/resolver";`);
        imports.push(`import ${relationship.type.__name}Metadata from "../${relationship.type.__name}/${relationship.type.__name}";`);
      }

      if (!typeImports.has("flatMap")) {
        typeImports.add("flatMap");
        imports.push(`import flatMap from "lodash.flatmap";`);
      }

      if (!typeImports.has("dataloader")) {
        typeImports.add("dataloader");
        imports.push(`import DataLoader from "dataloader";`);
      }

      if (relationship.__isArray) {
        relationshipResolvers += projectIdsResolverTemplate
          .replace(/\${table}/g, relationship.type.table)
          .replace(/\${fkField}/g, relationship.fkField)
          .replace(/\${targetObjName}/g, relationshipName)
          .replace(/\${targetTypeName}/g, relationship.type.__name)
          .replace(/\${targetTypeNameLower}/g, relationship.type.__name.toLowerCase())
          .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
          .replace(/\${sourceObjName}/g, objectToCreate.__name)
          .replace(/\${dataLoaderId}/g, `__${objectToCreate.__name}_${relationshipName}DataLoader`);
      } else if (relationship.__isObject) {
        relationshipResolvers += projectIdResolverTemplate
          .replace(/\${table}/g, relationship.type.table)
          .replace(/\${fkField}/g, relationship.fkField)
          .replace(/\${targetObjName}/g, relationshipName)
          .replace(/\${targetTypeName}/g, relationship.type.__name)
          .replace(/\${targetTypeNameLower}/g, relationship.type.__name.toLowerCase())
          .replace(/\${sourceParam}/g, objectToCreate.__name.toLowerCase())
          .replace(/\${sourceObjName}/g, objectToCreate.__name)
          .replace(/\${dataLoaderId}/g, `__${objectToCreate.__name}_${relationshipName}DataLoader`);
      }

      if (index < all.length - 1) {
        relationshipResolvers += ",\n";
      }
    });
  }

  result += template
    .replace(/\${queryItems}/g, queryItems)
    .replace(/\${mutationItems}/g, mutationItems)
    .replace(/\${relationshipResolvers}/g, relationshipResolvers)
    .replace(/\${table}/g, objectToCreate.table)
    .replace(/\${objName}/g, objectToCreate.__name)
    .replace(/\${objNameLower}/g, objectToCreate.__name.toLowerCase());

  return `
${imports.join("\n")}

${result}`.trim();
}
