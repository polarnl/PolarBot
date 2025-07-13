import { Db } from 'mongodb';
export declare function connectToDatabase(): Promise<Db>;
export declare function getDatabase(): Promise<Db>;
export declare function getCollection(collectionName: string): Promise<import("mongodb").Collection<import("bson").Document>>;
//# sourceMappingURL=database.d.ts.map