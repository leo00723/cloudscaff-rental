import { User } from 'src/app/models/user.model';

export class SetUser {
  static readonly type = '[user] set user';
  constructor(public payload: User) {}
}

export class GetUser {
  static readonly type = '[userId] get user';
  constructor(public payload: string) {}
}

export class UpdateProfile {
  static readonly type = '[needsSetup] setup profile';
  constructor(public payload: string) {}
}
