import { Client, Account, ID, Avatars, Databases, Models, Query } from 'react-native-appwrite/src';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.ashot.aora',
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DB_ID!,
  userCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USER_COLLECTION_ID!,
  videoCollectionId: process.env.EXPO_PUBLIC_APPWRITE_VIDEO_COLLECTION_ID!,
  storageId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_ID!,
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform)

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const signIn = async (email: string, password: string): Promise<Models.Session> => {
  try {
    return await account.createEmailPasswordSession(email, password);
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const createUser = async (email: string, password: string, username: string): Promise<Models.Document> => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw Error('Failed to create a user');

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    return await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl
      }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export const getCurrentUser = async (): Promise<Models.Document> => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error('No account found');

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );

    if (!currentAccount) throw Error('No user');

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);

    throw error;
  }
}
