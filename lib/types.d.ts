import { Models } from "react-native-appwrite/src";
import { DocumentPickerAsset } from "expo-document-picker/src/types";

export interface IUser extends Models.Document {
  username: string;
  avatar: string;
}

export interface IVideoProperties {
  title: string;
  thumbnail: string;
  video: string;
  prompt: string;
}

export interface IVideoFormData extends Omit<IVideoProperties, 'video' | 'thumbnail'>{
  video: DocumentPickerAsset | null;
  thumbnail: DocumentPickerAsset | null;
  userId: string;
}

export interface IVideo extends Models.Document, IVideoProperties {
  creator: IUser;
}
