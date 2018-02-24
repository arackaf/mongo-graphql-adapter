export async function load${objName}s(db, queryPacket) {
  let { $match, $project, $sort, $limit, $skip } = queryPacket;

  let aggregateItems = [
    { $match }, 
    { $project },
    $sort ? { $sort } : null, 
    $skip != null ? { $skip } : null, 
    $limit != null ? { $limit } : null
  ].filter(item => item);

  let ${objName}s = await dbHelpers.runQuery(db, "${table}", aggregateItems);
  await processHook(hooksObj, "${objName}", "adjustResults", ${objName}s);
  return ${objName}s;
}

export const ${objName} = {
${relationshipResolvers}
}

export default {
  Query: {
${queryItems}
  },
  Mutation: {
${mutationItems}
  }
};
