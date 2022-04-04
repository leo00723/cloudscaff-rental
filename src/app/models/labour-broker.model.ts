import { Labour } from './labour.model';

export interface LabourBroker {
  id?: string;
  name?: string;
  types?: Labour[];
}
