import spinUp from "./spinUp";
import { ObjectId } from "mongodb";

let db, schema, queryAndMatchArray, runMutation;
beforeAll(async () => {
  ({ db, schema, queryAndMatchArray, runMutation } = await spinUp());

  let adam = { name: "Adam", birthday: new Date("1982-03-22") };
  let katie = { name: "Katie", birthday: new Date("2009-08-05") };
  let laura = { name: "Laura", birthday: new Date("1974-12-19") };
  let mallory = { name: "Mallory", birthday: new Date("1956-08-02") };

  await Promise.all([adam, katie, laura, mallory].map(person => db.collection("authors").insert(person)));

  let book1 = { title: "Book 1", pages: 100, authorNames: [adam.name] };
  let book2 = { title: "Book 2", pages: 150, authorNames: [adam.name] };
  let book3 = { title: "Book 3", pages: 200, authorNames: [katie.name] };

  await db.collection("books").insert(book1);
  await db.collection("books").insert(book2);
  await db.collection("books").insert(book3);

  await db.collection("authors").update({ _id: ObjectId(adam._id) }, { $set: { firstBookId: book2._id } });
});

afterAll(async () => {
  await db.collection("books").remove({});
  await db.collection("authors").remove({});
  db.close();
  db = null;
});

test("Read authors", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, authorsByName{name}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", authorsByName: [{ name: "Adam" }] },
      { title: "Book 2", authorsByName: [{ name: "Adam" }] },
      { title: "Book 3", authorsByName: [{ name: "Katie" }] }
    ]
  });
});

test("Read authors' first book", async () => {
  await queryAndMatchArray({
    query: `{allBooks(title_startsWith: "B"){Books{title, authorsByName{name, firstBook{title}}}}}`,
    coll: "allBooks",
    results: [
      { title: "Book 1", authorsByName: [{ name: "Adam", firstBook: { title: "Book 2" } }] },
      { title: "Book 2", authorsByName: [{ name: "Adam", firstBook: { title: "Book 2" } }] },
      { title: "Book 3", authorsByName: [{ name: "Katie", firstBook: null }] }
    ]
  });
});
