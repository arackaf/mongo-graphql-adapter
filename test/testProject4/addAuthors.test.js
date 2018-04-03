import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
let adam, katie, laura, mallory, book1, book2, book3;

beforeEach(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  adam = { name: "Adam", birthday: new Date("1982-03-22") };
  katie = { name: "Katie", birthday: new Date("2009-08-05") };
  laura = { name: "Laura", birthday: new Date("1974-12-19") };
  mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insert(person)));

  book1 = { title: "Book 1", pages: 100, authorIds: ["" + adam._id] };
  book2 = { title: "Book 2", pages: 150, authorIds: ["" + adam._id] };
  book3 = { title: "Book 3", pages: 200, authorIds: ["" + katie._id] };

  await db.collection("books").insert(book1);
  await db.collection("books").insert(book2);
  await db.collection("books").insert(book3);

  await db.collection("authors").update({ _id: ObjectId(adam._id) }, { $set: { firstBookId: "" + book2._id } });
});

afterEach(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  db.close();
  db = null;
});

test("Basic add single new author", async () => {
  await runMutation({
    mutation: `updateBook(_id: "${book1._id}", Updates: {authors_ADD: { name: "New Author" }}){Book{title}}`,
    result: "updateBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(title: "Book 1"){Books{title, authors(SORT: { name: 1 }){name}}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", authors: [{ name: "Adam" }, { name: "New Author" }] }]
  });
});

test("Basic add single new author, and single existing author", async () => {
  await runMutation({
    mutation: `updateBook(_id: "${book1._id}", Updates: {authors_ADD: { name: "New Author" }, authorIds_ADDTOSET: "${katie._id}"}){Book{title}}`,
    result: "updateBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(title: "Book 1"){Books{title, authors(SORT: { name: 1 }){name}}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", authors: [{ name: "Adam" }, { name: "Katie" }, { name: "New Author" }] }]
  });
});

test("Basic add single new author in array", async () => {
  await runMutation({
    mutation: `updateBook(_id: "${book1._id}", Updates: {authors_ADD: [{ name: "New Author" }]}){Book{title}}`,
    result: "updateBook"
  });

  await queryAndMatchArray({
    query: `{allBooks(title: "Book 1"){Books{title, authors(SORT: { name: 1 }){name}}}}`,
    coll: "allBooks",
    results: [{ title: "Book 1", authors: [{ name: "Adam" }, { name: "New Author" }] }]
  });
});
