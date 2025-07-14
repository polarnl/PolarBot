import dotenv from "dotenv";
dotenv.config();
import { MongoClient } from "mongodb";
const uri = process.env["MONGODB_URI"];
const client = new MongoClient(uri);
const dbName = process.env["DB_NAME"] || "polarbot";
export async function connectToDatabase() {
    await client.connect();
    return client.db(dbName);
}
export async function getCollection(name) {
    await client.connect();
    return client.db(dbName).collection(name);
}
``;
//# sourceMappingURL=database.js.map