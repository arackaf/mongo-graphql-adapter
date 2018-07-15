export const type = `
  
  type Tag {
    _id: String
    name: String
    count: Int
  }

  type TagQueryResults {
    Tags: [Tag]
    Meta: QueryResultsMetadata
  }

  type TagSingleQueryResult {
    Tag: Tag
  }

  type TagMutationResult {
    success: Boolean
    Tag: Tag
  }

  type TagMutationResultMulti {
    success: Boolean
    Tags: [Tag]
  }

  type TagBulkMutationResult {
    success: Boolean
  }

  input TagInput {
    _id: String
    name: String
    count: Int
  }

  input TagMutationInput {
    name: String
    count: Int
    count_INC: Int
    count_DEC: Int
  }

  input TagSort {
    _id: Int
    name: Int
    count: Int
  }

  input TagFilters {
    _id_contains: String
    _id_startsWith: String
    _id_endsWith: String
    _id_regex: String
    _id: String
    _id_ne: String
    _id_in: [String]
    name_contains: String
    name_startsWith: String
    name_endsWith: String
    name_regex: String
    name: String
    name_ne: String
    name_in: [String]
    count_lt: Int
    count_lte: Int
    count_gt: Int
    count_gte: Int
    count: Int
    count_ne: Int
    count_in: [Int]
    OR: [TagFilters]
  }
  
`;
  
  
export const mutation = `

  createTag (
    Tag: TagInput
  ): TagMutationResult

  updateTag (
    _id: String,
    Updates: TagMutationInput
  ): TagMutationResult

  updateTags (
    _ids: [String],
    Updates: TagMutationInput
  ): TagMutationResultMulti

  updateTagsBulk (
    Match: TagFilters,
    Updates: TagMutationInput
  ): TagBulkMutationResult

  deleteTag (
    _id: String
  ): Boolean

`;


export const query = `

  allTags (
    _id_contains: String,
    _id_startsWith: String,
    _id_endsWith: String,
    _id_regex: String,
    _id: String,
    _id_ne: String,
    _id_in: [String],
    name_contains: String,
    name_startsWith: String,
    name_endsWith: String,
    name_regex: String,
    name: String,
    name_ne: String,
    name_in: [String],
    count_lt: Int,
    count_lte: Int,
    count_gt: Int,
    count_gte: Int,
    count: Int,
    count_ne: Int,
    count_in: [Int],
    OR: [TagFilters],
    SORT: TagSort,
    SORTS: [TagSort],
    LIMIT: Int,
    SKIP: Int,
    PAGE: Int,
    PAGE_SIZE: Int
  ): TagQueryResults

  getTag (
    _id: String
  ): TagSingleQueryResult

`;
  
