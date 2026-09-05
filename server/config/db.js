const mongoose = require('mongoose');

let mongod;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri.includes('xxxxx')) {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        uri = mongod.getUri();
        console.log(`In-memory MongoDB started at: ${uri}`);
      } catch (e) {
        console.error(`No valid MONGODB_URI set and mongodb-memory-server is not installed: ${e.message}`);
        process.exit(1);
      }
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
