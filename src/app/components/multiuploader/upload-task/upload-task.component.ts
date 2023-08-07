import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import {
  Storage,
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { UploadedFile } from 'src/app/models/uploadedFile.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-upload-task',
  templateUrl: './upload-task.component.html',
  styleUrls: ['./upload-task.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadTaskComponent implements OnInit {
  @Input() file: File;
  @Output() deleted = new EventEmitter<boolean>();
  path: string;
  downloadUrl: string;
  percentage: number;
  snapshot: Observable<any>;
  uploading = false;
  private storage: Storage = inject(Storage);
  private store: Store = inject(Store);
  private change: ChangeDetectorRef = inject(ChangeDetectorRef);
  private masterSvc: MasterService = inject(MasterService);

  ngOnInit(): void {}

  startUpload(): Promise<UploadedFile> {
    return new Promise<UploadedFile>((resolve, reject) => {
      this.uploading = true;
      const company = this.store.selectSnapshot(CompanyState.company);
      this.path = `company/${company.id}/uploads/${Date.now()}_${
        this.file.name
      }`;
      const storageRef = ref(this.storage, this.path);
      const uploadTask = uploadBytesResumable(storageRef, this.file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          this.percentage = snapshot.bytesTransferred / snapshot.totalBytes;
          this.change.detectChanges();
        },
        (error) => {
          this.file = null;
          this.change.detectChanges();
          console.error(error);
          reject(error); // Reject the promise with the error
        },
        async () => {
          this.downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const data = {
            file: this.file.name,
            type: this.file.type,
            ref: this.path,
            downloadUrl: this.downloadUrl,
          };
          this.uploading = false;
          this.change.detectChanges();
          resolve(data); // Resolve the promise
          this.deleted.emit(true);
        }
      );
    });
  }

  deleteFile(path: string) {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      const file = ref(this.storage, path);
      await deleteObject(file);
      this.deleted.emit(true);
    });
  }

  removeFile() {
    this.masterSvc.notification().presentAlertConfirm(async () => {
      this.deleted.emit(true);
    });
  }
}
