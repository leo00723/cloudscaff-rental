import { Estimate } from 'src/app/models/estimate.model';

export class SetEstimates {
  static readonly type = '[estimates] set estimates';
  constructor(public payload: Estimate[]) {}
}

export class GetEstimates {
  static readonly type = '[companyId] get estimates';
  constructor(public payload?: string) {}
}
