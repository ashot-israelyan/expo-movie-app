import { Client, Account, ID } from 'react-native-appwrite/src';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.ashot.aora',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DB_ID,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID,
  videoCollectionId: process.env.EXPO_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID,
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID,
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform)

export const createUser = () => {
  const account = new Account(client);

  account.create(ID.unique(), 'me@example.com', 'password', 'Jane Doe')
    .then(response => {
      console.log(response);
    })
}
