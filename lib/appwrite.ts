import { Client, Account, ID, Avatars, Databases, Models, Storage, Query } from 'react-native-appwrite/src';
import { IVideo, IVideoFormData } from "@/lib/types";
import { DocumentPickerAsset } from "expo-document-picker/src/types";
import { file } from "@babel/types";
import { ImageGravity } from "react-native-appwrite/src/enums/image-gravity";

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
const storage = new Storage(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const signIn = async (email: string, password: string): Promise<Models.Session> => {
  return await account.createEmailPasswordSession(email, password);
}

export const createUser = async (email: string, password: string, username: string): Promise<Models.Document> => {
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
}

export const getCurrentUser = async (): Promise<Models.Document> => {
  const currentAccount = await account.get();

  if (!currentAccount) throw Error('No account found');

  const currentUser = await databases.listDocuments(
    config.databaseId,
    config.userCollectionId,
    [Query.equal('accountId', currentAccount.$id)]
  );

  if (!currentAccount) throw Error('No user');

  return currentUser.documents[0];
}

export const signOut = async () => {
  return await account.deleteSession('current');
}

export const getAllPosts = async (): Promise<IVideo[]> => {
  const posts = await databases.listDocuments<IVideo>(
    config.databaseId,
    config.videoCollectionId,
    [Query.orderDesc('$createdAt'), Query.limit(7)]
  );

  return posts.documents;
}

export const searchPosts = async (query: string): Promise<IVideo[]> => {
  const posts = await databases.listDocuments<IVideo>(
    config.databaseId,
    config.videoCollectionId,
    [Query.search("title", query)]
  );

  if (!posts) throw new Error('Something went wrong');

  return posts.documents;
}

export const getUserPosts = async (userId: string): Promise<IVideo[]> => {
  const posts = await databases.listDocuments<IVideo>(
    config.databaseId,
    config.videoCollectionId,
    [Query.equal("creator", userId)]
  );

  if (!posts) throw new Error('Something went wrong');

  return posts.documents;
}

export const getLatestPosts = async (): Promise<IVideo[]> => {
  const posts = await databases.listDocuments<IVideo>(
    config.databaseId,
    config.videoCollectionId,
    [Query.orderDesc("$createdAt"), Query.limit(7)]
  );

  return posts.documents;
}

export const getFilePreview = async (fileId: string, type: 'image' | 'video') => {
  let fileUrl;

  if (type === 'video') {
    fileUrl = storage.getFileView(config.storageId, fileId);
  } else if (type === 'image') {
    fileUrl = storage.getFilePreview(
      config.storageId,
      fileId,
      2000,
      2000,
      ImageGravity.Top,
      100
    );
  } else {
    throw new Error("Invalid file type");
  }

  if (!fileUrl) throw Error('File upload failed');

  return fileUrl;
}

export const uploadFile = async (file: DocumentPickerAsset | null, type: 'image' | 'video') => {
  if (!file) return;

  const asset = {
    type: file.mimeType as string,
    name: file.name,
    size: file.size as number,
    uri: file.uri,
  };

  const uploadedFile = await storage.createFile(
    config.storageId,
    ID.unique(),
    asset,
  );

  return await getFilePreview(uploadedFile.$id, type);
}

export const createVideoPost = async (form: IVideoFormData) => {
  const [thumbnailUrl, videoUrl] = await Promise.all([
    uploadFile(form.thumbnail, "image"),
    uploadFile(form.video, "video"),
  ]);

  const newPost = await databases.createDocument(
    config.databaseId,
    config.videoCollectionId,
    ID.unique(),
    {
      title: form.title,
      thumbnail: thumbnailUrl,
      video: videoUrl,
      prompt: form.prompt,
      creator: form.userId,
    }
  );

  return newPost;
};
