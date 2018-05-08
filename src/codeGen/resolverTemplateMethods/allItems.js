    async all${objName}s(root, args, context, ast) {
      await processHook(hooksObj, "${objName}", "queryPreprocess", root, args, context, ast);
      let db = await root.db;
      context.__mongodb = db;
      let queryPacket = decontructGraphqlQuery(args, ast, ${objName}Metadata, "${objName}s");
      await processHook(hooksObj, "${objName}", "queryMiddleware", queryPacket, root, args, context, ast);
      let result = {};

      if (queryPacket.$project) {
        result.${objName}s = await load${objName}s(db, queryPacket, root, args, context, ast);
      }

      if (queryPacket.metadataRequested.size) {
        result.Meta = {};

        if (queryPacket.metadataRequested.get("count")) {
          let countResults = await dbHelpers.runQuery(db, "${table}", [{ $match: queryPacket.$match }, { $group: { _id: null, count: { $sum: 1 } } }]);  
          result.Meta.count = countResults.length ? countResults[0].count : 0;
        }
      }

      return result;
    }