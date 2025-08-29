import { Injectable } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytes,
} from '@angular/fire/storage';
import { Photo } from '@capacitor/camera';
@Injectable({
  providedIn: 'root',
})
export class ImgService {
  constructor(private storage: Storage) {}

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
  async uploadBlob(image: Blob, path: string, deleteRef?: string) {
    try {
      if (deleteRef.length > 0) {
        await this.deleteFile(`${deleteRef}_1280x720.webp`);
      }

      await uploadBytes(ref(this.storage, `${path}.webp`), image);

      let url: string;

      while (!url) {
        try {
          url = await getDownloadURL(
            ref(this.storage, `${path}_1280x720.webp`)
          );
        } catch (e) {}
      }

      const data = {
        url,
        ref: path,
      };
      return data;
    } catch (e) {
      return null;
    }
  }
  async uploadBlobNoResize(image: Blob, path: string) {
    try {
      await uploadBytes(ref(this.storage, `${path}`), image);

      const url = await getDownloadURL(ref(this.storage, `${path}`));

      const data = {
        url,
        ref: path,
      };
      return data;
    } catch (e) {
      return null;
    }
  }

  async deleteFile(path: string) {
    const img = ref(this.storage, path);
    return await deleteObject(img);
  }
}
