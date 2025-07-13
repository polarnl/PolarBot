import { MongoClient } from 'mongodb';
let db = null;
export async function connectToDatabase() {
    if (db) {
        return db;
    }
    const mongoUri = process.env['MONGODB_URI'];
    if (!mongoUri) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    const client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db('polarBot');
    console.log('Connected to MongoDB');
    return db;
}
export async function getDatabase() {
    if (!db) {
        return await connectToDatabase();
    }
    return db;
}
export async function getCollection(collectionName) {
    const database = await getDatabase();
    return database.collection(collectionName);
}
//# sourceMappingURL=database.js.map