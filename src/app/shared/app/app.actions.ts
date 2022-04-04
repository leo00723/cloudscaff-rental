export class SetVersion {
  static readonly type = '[version] set version';
  constructor(public payload: { version: string; message: string }) {}
}
export class GetVersion {
  static readonly type = '[versionId] get version';
  constructor(public payload: string) {}
}
