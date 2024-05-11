import { Models } from "react-native-appwrite/src";

export interface IUser extends Models.Document {
  username: string;
  avatar: string;
}

export interface IVideo extends Models.Document {
  title: string;
  thumbnail: string;
  video: string;
  prompt: string;
  creator: IUser;
}
