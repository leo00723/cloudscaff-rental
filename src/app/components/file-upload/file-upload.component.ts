import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  ref,
  Storage,
  uploadBytesResumable,
} from '@angular/fire/storage';
import { Company } from 'src/app/models/company.model';
import { UploadedFile } from 'src/app/models/uploadedFile.model';
import { MasterService } from 'src/app/services/master.service';
import { CompanyState } from 'src/app/shared/company/company.state';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements OnInit {
  @Output() result = new EventEmitter<UploadedFile | null>();
  @Input() set value(data: UploadedFile) {
    if (data) {
      this.fileName = data.file;
      this.ref = data.ref;
      this.downloadUrl = data.downloadUrl;
    }
  }
  file: File;
  fileName: string;
  downloadUrl: string;
  ref: string;
  progress = 0;
  uploading = false;

  constructor(
    private storage: Storage,
    private masterSvc: MasterService,
    private change: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  chooseFile($event) {
    this.file = $event.target.files[0];
    this.fileName = this.file.name;
    this.uploadFile();
  }
  uploadFile() {
    if (this.file) {
      this.uploading = true;
      const company: Company = this.masterSvc
        .store()
        .selectSnapshot(CompanyState.company);
      this.ref = `company/${company.id}/uploads/${this.file.name}`;
      const storageRef = ref(this.storage, this.ref);
      const uploadTask = uploadBytesResumable(storageRef, this.file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          this.progress = snapshot.bytesTransferred / snapshot.totalBytes;
          this.change.detectChanges();
        },
        (error) => {
          this.file = null;
          this.fileName = null;
          this.ref = null;
          this.downloadUrl = null;
          this.change.detectChanges();

          console.error(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
            this.downloadUrl = downloadUrl;
            this.result.emit({
              file: this.fileName,
              ref: this.ref,
              downloadUrl: this.downloadUrl,
            });
            this.change.detectChanges();
          });
        }
      );
      return Promise.resolve();
    }
  }

  deleteFile(path: string) {
    this.masterSvc.notification().presentAlertConfirm(() => {
      const file = ref(this.storage, path);
      deleteObject(file).then(() => {
        this.file = null;
        this.fileName = null;
        this.ref = null;
        this.downloadUrl = null;
        this.result.emit(null);
        this.change.detectChanges();
      });
    });
  }
}
