export const startDbMutation = async (root, args, context, objName, typeMetadata, { create, update }) => {
  let [db, client] = await Promise.all([
    typeof root.db === "function" ? await root.db() : root.db,
    typeof root.client === "function" ? await root.client() : root.client
  ]);
  let session = client ? client.startSession() : null;
  let transaction = false;
  if (session && session.startTransaction) {
    if (create && mutationRequiresTransaction({ typeMetadata, newObjectArgs: args[objName] })) {
      transaction = true;
    }
    if (update) {
      transaction = true;
    }
  }
  if (transaction) {
    session.startTransaction();
  }
  context.__mongodb = db;
  return { db, client, session, transaction };
};

export const mutationComplete = async (session, transaction) => {
  if (transaction) {
    await session.commitTransaction();
  }
};

export const mutationError = async (err, session, transaction) => {
  if (transaction) {
    await session.abortTransaction();
  }
  throw err;
};

export const mutationOver = session => {
  if (session) {
    session.endSession();
  }
};

export const mutationRequiresTransaction = ({ typeMetadata, newObjectArgs }) => {
  if (newObjectArgs) {
    return newObjectMutationRequiresTransaction(typeMetadata, newObjectArgs);
  }
};

export const newObjectMutationRequiresTransaction = (typeMetadata, args) => {
  let relationships = typeMetadata.relationships || {};
  for (let k of Object.keys(relationships)) {
    let relationship = relationships[k];
    if (relationship.oneToMany) {
      if (args[k]) {
        return true;
      }
    } else {
      if (relationship.__isArray) {
        if (args[k]) {
          return true;
        }
      } else if (relationship.__isObject) {
        if (args[k]) {
          return true;
        }
      }
    }
  }
  return false;
};
