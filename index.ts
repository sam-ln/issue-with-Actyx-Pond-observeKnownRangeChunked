import { Pond, Tags } from "@actyx/pond";

multipleQueries();

async function multipleQueries() {
  //The behavior does not happen with the test pond
  //const pond = Pond.test()

  const pond = await Pond.default({
    appId: "com.example.issue",
    displayName: "Issue",
    version: "1.0",
  });
  const TEST_CHUNK_SIZE = 20; //could be any number

  //First query that contains an empty tag runs through
  //and executes its onComplete method
  await new Promise<void>((resolve) => {
    pond.events().queryKnownRangeChunked(
      {
        upperBound: {}, //Bounds are not relevant to the unexpected behavior
        query: Tags("tags_with_an_empty_entry", ""),
      },
      TEST_CHUNK_SIZE,
      ({ events }) => {},
      () => {
        console.log("First query finished");
        resolve();
      }
    );
  });

  //The query after a query that contained an empty tag
  //will never execute it's onComplete method.
  await new Promise<void>((resolve) => {
    pond.events().queryKnownRangeChunked(
      {
        upperBound: {}, //Bounds are not relevant to the unexpected behavior
        query: Tags("tags_without_an_empty_entry"),
      },
      TEST_CHUNK_SIZE,
      ({ events }) => {},
      () => {
        console.log("Second query finished");
        resolve();
      }
    );
  });
}
