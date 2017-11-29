import { dataTypes } from "mongo-graphql-starter";
const { StringType, StringArrayType } = dataTypes;

const fields = {
  field1: StringType,
  field2: StringType,
  field3: StringType,
  field4: StringType,
  field5: StringType,
  field6: StringType
};

const Type1 = {
  table: "type1",
  fields
};

const Type2 = {
  table: "type2",
  fields
};

const Type3 = {
  table: "type3",
  fields
};

const Type4 = {
  table: "type4",
  fields
};

export default {
  Type1,
  Type2,
  Type3,
  Type4
};
