/* eslint-disable @typescript-eslint/naming-convention */
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { IonInput } from '@ionic/angular';
import { Address } from 'src/app/models/address.model';
declare const google;

/**
 * Address Search Component using Google Places Autocomplete API
 * Implements industry-standard address component mapping for reliable international support
 *
 * US Address Mapping:
 * - address: street number + route
 * - suburb: city (locality)
 * - city: state (administrative_area_level_1)
 * - zip: postal_code
 * - country: country
 *
 * International Address Mapping:
 * - address: street number + route
 * - suburb: sublocality/neighborhood/postal_town
 * - city: locality/administrative_area_level_2/administrative_area_level_1
 * - zip: postal_code
 * - country: country
 */
@Component({
  selector: 'app-address-search',
  templateUrl: './address-search.component.html',
})
export class AddressSearchComponent implements AfterViewInit {
  @Input() placeholder = 'Search for location or business';
  @Output() addressData = new EventEmitter<Address>();
  @ViewChild('autocomplete') autocomplete: IonInput;

  ngAfterViewInit(): void {
    this.autocomplete.getInputElement().then((ref) => {
      const autocomplete = new google.maps.places.Autocomplete(ref);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();

        // Industry standard Google Places API component mapping
        // Includes comprehensive address types for international compatibility
        const addressNameFormat = {
          street_number: 'short_name',
          route: 'long_name',
          locality: 'long_name',
          administrative_area_level_1: 'long_name',
          administrative_area_level_2: 'long_name',
          neighborhood: 'long_name',
          sublocality_level_1: 'long_name',
          sublocality_level_2: 'long_name',
          postal_town: 'long_name',
          country: 'long_name',
          postal_code: 'short_name',
          premise: 'short_name',
          subpremise: 'short_name',
        };

        // Improved component extraction that checks all types, not just the first one
        // This ensures reliable mapping across different countries and address formats
        const getAddressComponent = (
          targetTypes: string[],
          format: 'short_name' | 'long_name' = 'long_name'
        ) => {
          for (const component of place.address_components || []) {
            for (const type of targetTypes) {
              if (component.types?.includes(type)) {
                return component[format] || '';
              }
            }
          }
          return '';
        };

        // Build street address with proper formatting
        const streetNumber = getAddressComponent(
          ['street_number'],
          'short_name'
        );
        const route = getAddressComponent(['route'], 'long_name');
        const premise = getAddressComponent(['premise'], 'short_name');
        const subpremise = getAddressComponent(['subpremise'], 'short_name');

        let streetAddress = '';
        if (streetNumber && route) {
          streetAddress = `${streetNumber} ${route}`;
        } else if (route) {
          streetAddress = route;
        } else if (premise) {
          streetAddress = premise;
        }

        if (subpremise) {
          streetAddress = streetAddress
            ? `${streetAddress}, ${subpremise}`
            : subpremise;
        }

        // Get country
        const country = getAddressComponent(['country'], 'long_name');

        // Get postal code
        const postalCode = getAddressComponent(['postal_code'], 'short_name');

        // Determine if this is a US address for specific mapping
        const isUSAddress = ['US', 'AUS'].includes(
          getAddressComponent(['country'], 'short_name')
        );

        let finalSuburb: string;
        let finalCity: string;

        if (isUSAddress) {
          // For US addresses: put city in suburb field and state in city field
          finalSuburb = getAddressComponent(['locality'], 'long_name'); // US city goes to suburb
          finalCity = getAddressComponent(
            ['administrative_area_level_1'],
            'long_name'
          ); // US state goes to city
        } else {
          // For non-US addresses: use standard international mapping
          finalSuburb = getAddressComponent(
            [
              'sublocality_level_1',
              'sublocality_level_2',
              'neighborhood',
              'postal_town',
            ],
            'long_name'
          );
          finalCity = getAddressComponent(
            [
              'locality',
              'administrative_area_level_2',
              'administrative_area_level_1',
            ],
            'long_name'
          );
        }

        // Emit the properly mapped address
        this.addressData.emit({
          address: streetAddress || place.name || '',
          suburb: finalSuburb,
          city: finalCity,
          zip: postalCode,
          country,
          url: place.url || '',
        });
      });
    });
  }
}
