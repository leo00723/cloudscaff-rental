import { Site } from 'src/app/models/site.model';

export class SetSites {
  static readonly type = '[sites] set sites';
  constructor(public payload: Site[]) {}
}

export class GetSites {
  static readonly type = '[companyId] get sites';
  constructor(public payload?: string) {}
}
