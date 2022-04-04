export interface RateProfile {
  code?: number;
  name?: string;
  rate?: number;
}
export class RateProfiles {
  scaffoldRates: RateProfile[] = [
    { code: 0, name: 'Fixed Rate', rate: 0 },
    { code: 1, name: 'L x Rate', rate: 0 },
    { code: 2, name: 'W x Rate', rate: 0 },
    { code: 3, name: 'H x Rate', rate: 0 },
    { code: 4, name: 'L x W x Rate', rate: 0 },
    { code: 5, name: 'L x H x Rate', rate: 0 },
    { code: 6, name: 'W x H x Rate', rate: 0 },
    { code: 7, name: 'L x W x H x Rate', rate: 0 },
    { code: 8, name: 'Squares x Rate', rate: 0 },
  ];
  boardRates: RateProfile[] = [
    { code: 0, name: 'Fixed Rate', rate: 0 },
    { code: 1, name: 'L x Rate', rate: 0 },
    { code: 2, name: 'W x Rate', rate: 0 },
    { code: 3, name: 'H x Rate', rate: 0 },
    { code: 4, name: 'L x W x Rate', rate: 0 },
  ];
  hireRates: RateProfile[] = [
    { code: 0, name: 'Fixed Rate', rate: 0 },
    { code: 1, name: 'Days x Rate', rate: 0 },
    { code: 2, name: '% of Total', rate: 0 },
    { code: 3, name: '% of Total x Days', rate: 0 },
  ];
  additionalRates: RateProfile[] = [
    { code: 0, name: 'Fixed Rate', rate: 0 },
    { code: 1, name: 'Days x Rate', rate: 0 },
  ];
}
