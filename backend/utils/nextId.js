// MongoDB has no AUTO_INCREMENT. The `counters` collection keeps the last id
// handed out per table (02_seed.js fills it from the seeded data), and $inc
// on a single document is atomic, so two requests can never get the same id.
// Pass the session when calling inside a transaction: if the transaction
// aborts, the counter goes back too.
async function nextId(db, table, session) {
  const counter = await db.collection('counters').findOneAndUpdate(
    { _id: table },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after', session }
  );
  return counter.seq;
}

module.exports = nextId;
