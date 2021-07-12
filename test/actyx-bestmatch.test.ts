import { Pond, Tags } from "@actyx/pond";

//Those placeholder values are irrelevant.
const TEST_TAGS = ["some_tag"];
const TEST_PAYLOAD = "some event payload";
const TEST_STREAM_ID = "stream_0";

/**
 * I will try to use observeBestMatch to find the event which has
 * the greatest timestamp but whose timestamp is still lesser than or equal to 5.
 * In my example TestPond with 10 events this is the 6th event with a timestamp value of 5.
 */
describe("observeBestMatch", () => {
  const numberOfEvents = 10;
  const targetTimestampForBestMatch = 5;
  let testPond: Pond;
  beforeAll(() => (testPond = createSingleStreamTestPond(numberOfEvents)));
  afterAll(() => {
    testPond.dispose();
  });
  it(`should give the best match for an event with the highest timestamp that is no greater than ${targetTimestampForBestMatch}`, async () => {
    const actualTimestampOfBestMatch = await new Promise<number>(
      (resolve, _reject) => {
        const cancelSubscription = testPond.events().observeBestMatch(
          Tags(...TEST_TAGS),
          //shouldReplace function to determine if next candidate is more suitable than current best
          (nextCandidate, currentBest) => {
            const shouldReplaceValue =
              nextCandidate.meta.timestampMicros >
                currentBest.meta.timestampMicros &&
              nextCandidate.meta.timestampMicros <= 3;
            console.log(
              `Current best: ${currentBest.meta.timestampMicros}, Potential next candidate: ${nextCandidate.meta.timestampMicros}, shouldReplace returns: ${shouldReplaceValue}`
            );
            return shouldReplaceValue;
          },
          //onReplaced function to handle the determined best match
          (_event, metadata) => {
            cancelSubscription();
            console.log(
              `Resulting best match has timestamp: ${metadata.timestampMicros}`
            );
            //Return timestamp value
            resolve(metadata.timestampMicros);
          }
        );
      }
    );
    expect(actualTimestampOfBestMatch).toBe(targetTimestampForBestMatch);
  });
});

/**
 * Creates a simple TestPond with one stream and some events with gapless ascending
 * offsets, timestamps and lamport times, starting with 0.
 * This mimics a pond with a single ActyxOS node which has emitted some events.
 * @param numberOfEvents The amount of events to fill the TestPond with.
 * @returns TestPond filled with events
 */
function createSingleStreamTestPond(numberOfEvents: number): Pond {
  const testPond = Pond.test();
  for (let i = 0; i < numberOfEvents; i++) {
    testPond.directlyPushEvents([
      {
        offset: i,
        stream: TEST_STREAM_ID,
        timestamp: i,
        lamport: i,
        tags: TEST_TAGS,
        payload: TEST_PAYLOAD,
      },
    ]);
  }
  return testPond;
}
