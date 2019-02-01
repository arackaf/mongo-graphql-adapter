import { getDbObjects } from "../mutationHelpers";

export default ({ objName, table }) => `    async update${objName}s(root, args, context, ast) {
      ${getDbObjects({ objName })}
      let { $match, $project } = decontructGraphqlQuery({ _id_in: args._ids }, ast, ${objName}Metadata, "${objName}s");
      let updates = await getUpdateObject(args.Updates || {}, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast });

      if (await processHook(hooksObj, "${objName}", "beforeUpdate", $match, updates, root, args, context, ast) === false) {
        return { success: true };
      }
      await setUpOneToManyRelationshipsForUpdate(args._ids, args, ${objName}Metadata, { db, dbHelpers, hooksObj, root, args, context, ast });
      await dbHelpers.runUpdate(db, "${table}", $match, updates, { multi: true });
      await processHook(hooksObj, "${objName}", "afterUpdate", $match, updates, root, args, context, ast);
      
      let result = $project ? await load${objName}s(db, { $match, $project }, root, args, context, ast) : null;
      return {
        ${objName}s: result,
        success: true
      };
    }`;
