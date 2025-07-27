//D:\my-app\src\app\appwrite.js

import { Client, Account, ID, Databases, Realtime } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID); 

const account = new Account(client);
const databases = new Databases(client);
const realtime = new Realtime(client);
export { client, account, databases, realtime, ID };
