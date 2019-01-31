import { getDbObjects } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}sBulk(root, args, context, ast) {
      ${getDbObjects()}
      let { $match } = decontructGraphqlQuery(args.Match, ast, ${objName}Metadata);
      let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await dbHelpers.runUpdate(db, "${table}", $match, updates, { multi: true });
      await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, root, args, context, ast);

      return { success: true };
    }`;
