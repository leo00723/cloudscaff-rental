import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
  uploadString,
} from '@angular/fire/storage';
import { GalleryPhoto, Photo } from '@capacitor/camera';
@Injectable({
  providedIn: 'root',
})
export class ImgService {
  constructor(private firestore: Firestore, private storage: Storage) {}

  async uploadImage(cameraFile: Photo, path: string, type: string) {
    const storageRef = ref(this.storage, path);

    const base64Response = await fetch(
      `data:image/${type};base64,${cameraFile.base64String}`
    );

    const blob = await base64Response.blob();

    try {
      await uploadBytes(storageRef, blob);

      return await getDownloadURL(storageRef);
    } catch (e) {
      return null;
    }
  }
  async uploadBlob(image: GalleryPhoto, path: string, deleteRef: string) {
    const storageRef = ref(this.storage, path);
    if (deleteRef.length > 0) {
      await deleteObject(ref(this.storage, deleteRef));
    }

    const blob = await (await fetch(image.webPath)).blob();

    try {
      await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(storageRef);
      const data = {
        url,
        ref: storageRef.fullPath,
      };
      return data;
    } catch (e) {
      return null;
    }
  }
}
