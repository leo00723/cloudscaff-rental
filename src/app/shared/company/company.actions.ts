import { Company } from 'src/app/models/company.model';

export class SetCompany {
  static readonly type = '[company] set company';
  constructor(public payload: Company) {}
}

export class GetCompany {
  static readonly type = '[companyId] get company';
  constructor(public payload: string) {}
}
