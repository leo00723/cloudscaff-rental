import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilityService {
  constructor() {}

  getAddress(data: any): string {
    if (!data) {
      return;
    }
    const components = [
      data.address,
      data.suburb,
      data.city,
      data.zip,
      data.country,
    ];
    // Filter out null, undefined, and empty strings
    const nonEmptyComponents = components.filter((component) => component);
    return nonEmptyComponents.join(', ');
  }
}
