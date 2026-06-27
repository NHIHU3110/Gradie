const { getDb } = require('./api/_db');

async function run() {
  try {
    const db = await getDb();
    const collection = db.collection('settings');
    console.log("Connected to MongoDB settings.");

    const tikiKey = "8179278584636139";
    const tikiSecret = "SciY64mOb0b6pHaCRZBg8KMmh7DwI3M-";

    const result = await collection.updateOne(
      {},
      { 
        $set: { 
          tikiAppKey: tikiKey, 
          tikiAppSecret: tikiSecret,
          tikiAccessToken: "",
          tikiShopCipher: ""
        } 
      }
    );
    console.log("Database update result:", result);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
