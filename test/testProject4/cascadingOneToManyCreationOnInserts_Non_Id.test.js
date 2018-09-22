import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, runQuery, queryAndMatchArray, runMutation;
let adam, katie, laura, mallory, book1, book2, book3;

beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runQuery, runMutation } = await spinUp());
});

afterEach(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  await db.collection("subjects").remove({});
  await db.collection("keywords").remove({});
});

afterAll(async () => {
  db.close();
  db = null;
});

test("Add books in new author", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {name: "Adam", authorNamesBooks: [{title: "New Book 1"}] }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors{Authors{name, authorNamesBooks{title}}}}`,
    coll: "allAuthors",
    results: [{ name: "Adam", authorNamesBooks: [{ title: "New Book 1" }] }]
  });

  await queryAndMatchArray({
    query: `{allBooks{Books{title, authorNames}}}`,
    coll: "allBooks",
    results: [{ title: "New Book 1", authorNames: ["Adam"] }] //just one
  });
});

test("Add books entry in new author, and nested objects A", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      authorNamesBooks: [
        {
          title: "New Book 1",
          mainAuthor: {
            name: "ma",
            mainSubject: { name: "ms" },
            subjects: [{ name: "s1" }, { name: "s2" }]
          }
        }
      ]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, authorNamesBooks{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        authorNamesBooks: [
          { title: "New Book 1", mainAuthor: { name: "ma", mainSubject: { name: "ms" }, subjects: [{ name: "s1" }, { name: "s2" }] } }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }] //just one
  });
});

test("Add authorNamesBooks entry in new author, and nested objects B", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      authorNamesBooks: [
        {
          title: "New Book 1",
          mainAuthor: {
            name: "ma",
            mainSubject: { name: "ms" },
            subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }]
          }
        }
      ]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, authorNamesBooks{title, mainAuthor {name, mainSubject{name}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        authorNamesBooks: [
          {
            title: "New Book 1",
            mainAuthor: {
              name: "ma",
              mainSubject: { name: "ms" },
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });
});

test("Add authorNamesBooks entry in new author, and nested objects C", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      authorNamesBooks: [
        {
          title: "New Book 1",
          mainAuthor: {
            name: "ma",
            mainSubject: { name: "ms" },
            subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
            authorNamesBooks: [{title: "Nested Book 1"}]
          }
        }
      ]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, authorNamesBooks{title, mainAuthor {name, mainSubject{name}, authorNamesBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        authorNamesBooks: [
          {
            title: "New Book 1",
            mainAuthor: {
              name: "ma",
              mainSubject: { name: "ms" },
              authorNamesBooks: [{ title: "Nested Book 1" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title authorNames}}}`,
    coll: "allBooks",
    results: [{ title: "Nested Book 1", authorNames: ["ma"] }, { title: "New Book 1", authorNames: ["adam"] }]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });
});

test("Add authorNamesBooks entry in new author, and nested objects D", async () => {
  await runMutation({
    mutation: `createAuthor(Author: {
      name: "adam",
      authorNamesBooks: [
        {
          title: "New Book 1",
          authors: [{name: "a1", authorNamesBooks: [{title: "Nested Book A1"}]}],
          mainAuthor: {
            name: "ma",
            mainSubject: { name: "ms" },
            subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
            authorNamesBooks: [{title: "Nested Book B"}]
          }
        }
      ]
    }){Author{name}}`,
    result: "createAuthor"
  });

  await queryAndMatchArray({
    query: `{allAuthors(name: "adam"){Authors{name, authorNamesBooks{title, authors(SORT: {name: 1}){name, authorNamesBooks(SORT: {title: 1}){title}}, mainAuthor {name, mainSubject{name}, authorNamesBooks{title}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
    coll: "allAuthors",
    results: [
      {
        name: "adam",
        authorNamesBooks: [
          {
            title: "New Book 1",
            authors: [{ name: "a1", authorNamesBooks: [{ title: "Nested Book A1" }] }],
            mainAuthor: {
              name: "ma",
              mainSubject: { name: "ms" },
              authorNamesBooks: [{ title: "Nested Book B" }],
              subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
            }
          }
        ]
      }
    ]
  });

  await queryAndMatchArray({
    query: `{allBooks(SORT: {title: 1}){Books{title authorNames}}}`,
    coll: "allBooks",
    results: [
      { title: "Nested Book A1", authorNames: ["a1"] },
      { title: "Nested Book B", authorNames: ["ma"] },
      { title: "New Book 1", authorNames: ["adam"] }
    ]
  });

  await queryAndMatchArray({
    query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
    coll: "allSubjects",
    results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
  });

  await queryAndMatchArray({
    query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
    coll: "allKeywords",
    results: [{ keywordName: "k1" }, { keywordName: "k2" }]
  });

  await queryAndMatchArray({
    query: `{allAuthors(SORT: {name: 1}){Authors{name}}}`,
    coll: "allAuthors",
    results: [{ name: "a1" }, { name: "adam" }, { name: "ma" }]
  });
});

// test("Add books entry in new author, and nested objects E", async () => {
//   await runMutation({
//     mutation: `createAuthor(Author: {
//       name: "Adam",
//       books: [
//         {
//           title: "New Book 1",
//           authors: [{name: "A1", books: [{title: "Nested Book A1", authors: [{name: "A2", books: [{title: "B1"}]}]}]}],
//           mainAuthor: {
//             name: "MA",
//             mainSubject: { name: "ms" },
//             subjects: [{ name: "s1" }, { name: "s2", keywords: [{keywordName: "k1"}, {keywordName: "k2"}] }],
//             books: [{title: "Nested Book B", authors: [{name: "A3", books: [{title: "B2"}]}] }]
//           }
//         }
//       ]
//     }){Author{name}}`,
//     result: "createAuthor"
//   });

//   const A1_BOOKS = [{ title: "Nested Book A1" }, { title: "New Book 1" }];
//   const A2_BOOKS = [{ title: "B1" }, { title: "Nested Book A1" }];
//   const NEW_BOOK1_AUTHORS = [{ name: "A1", books: A1_BOOKS }, { name: "Adam", books: [{ title: "New Book 1" }] }];

//   await queryAndMatchArray({
//     query: `{allAuthors(name: "Adam"){Authors{name, books{title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title}}}}, mainAuthor {name, mainSubject{name}, books(SORT: {title: 1}){title, authors(SORT: {name: 1}){name, books(SORT: {title: 1}){title}}}, subjects(SORT: {name: 1}){name, keywords(SORT: {keywordName: 1}){keywordName}}} }}}}`,
//     coll: "allAuthors",
//     results: [
//       {
//         name: "Adam",
//         books: [
//           {
//             title: "New Book 1",
//             authors: [
//               {
//                 name: "A1",
//                 books: [
//                   {
//                     title: "Nested Book A1",
//                     authors: [{ name: "A1", books: A1_BOOKS }, { name: "A2", books: A2_BOOKS }]
//                   },
//                   {
//                     title: "New Book 1",
//                     authors: NEW_BOOK1_AUTHORS
//                   }
//                 ]
//               },
//               {
//                 name: "Adam",
//                 books: [
//                   {
//                     title: "New Book 1",
//                     authors: NEW_BOOK1_AUTHORS
//                   }
//                 ]
//               }
//             ],
//             mainAuthor: {
//               name: "MA",
//               mainSubject: { name: "ms" },
//               books: [
//                 {
//                   title: "Nested Book B",
//                   authors: [{ name: "A3", books: [{ title: "B2" }, { title: "Nested Book B" }] }, { name: "MA", books: [{ title: "Nested Book B" }] }]
//                 }
//               ],
//               subjects: [{ name: "s1", keywords: [] }, { name: "s2", keywords: [{ keywordName: "k1" }, { keywordName: "k2" }] }]
//             }
//           }
//         ]
//       }
//     ]
//   });

//   await queryAndMatchArray({
//     query: `{allBooks(SORT: {title: 1}){Books{title}}}`,
//     coll: "allBooks",
//     results: [{ title: "B1" }, { title: "B2" }, { title: "Nested Book A1" }, { title: "Nested Book B" }, { title: "New Book 1" }]
//   });

//   await queryAndMatchArray({
//     query: `{allSubjects(SORT: {name: 1}){Subjects{name}}}`,
//     coll: "allSubjects",
//     results: [{ name: "ms" }, { name: "s1" }, { name: "s2" }]
//   });

//   await queryAndMatchArray({
//     query: `{allKeywords(SORT: {keywordName: 1}){Keywords{keywordName}}}`,
//     coll: "allKeywords",
//     results: [{ keywordName: "k1" }, { keywordName: "k2" }]
//   });

//   await queryAndMatchArray({
//     query: `{allAuthors(SORT: {name: 1}){Authors{name}}}`,
//     coll: "allAuthors",
//     results: [{ name: "A1" }, { name: "A2" }, { name: "A3" }, { name: "Adam" }, { name: "MA" }]
//   });
// });
