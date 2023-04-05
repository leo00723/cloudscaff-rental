/* eslint-disable @typescript-eslint/naming-convention */
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Company } from '../models/company.model';
import { EditService } from './edit.service';
import { Customer } from '../models/customer.model';
import { XeroContact } from '../models/xero-contact.model';

const CUSTOMERS = 'https://api.xero.com/api.xro/2.0/Contacts';
const INVOICES = 'https://api.xero.com/api.xro/2.0/Invoices';
const TRACKING_CATEGORIES =
  'https://api.xero.com/api.xro/2.0/TrackingCategories';
const TAX_RATES = 'https://api.xero.com/api.xro/2.0/TaxRates';

const API_URL = 'https://identity.xero.com/connect/token';
const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://identity.xero.com',
  redirectUri: window.location.origin + '/dashboard/settings/company',
  clientId: environment.clientID,
  dummyClientSecret: environment.clientSecret,
  scope:
    'offline_access accounting.transactions openid profile email accounting.contacts accounting.settings',
  tokenEndpoint: 'https://identity.xero.com/connect/token',
  responseType: 'code',
  strictDiscoveryDocumentValidation: false,
};
@Injectable({
  providedIn: 'root',
})
export class XeroService {
  constructor(
    private http: HttpClient,
    public oauthService: OAuthService,
    private editService: EditService
  ) {
    this.oauthService.configure(authCodeFlowConfig);
  }

  async connect() {
    await this.oauthService.loadDiscoveryDocument();
    await this.oauthService.tryLoginCodeFlow();
    if (!this.oauthService.hasValidAccessToken()) {
      this.oauthService.initCodeFlow();
      return null;
    } else {
      return {
        accessToken: this.oauthService.getAccessToken(),
        refreshToken: this.oauthService.getRefreshToken(),
        lastUpdated: new Date(),
      };
    }
  }

  hasValidAccess() {
    return this.oauthService.hasValidAccessToken();
  }

  async getConnections(company: Company) {
    const { data } = await this.editService.callFunction('getXeroTenants', {
      companyID: company.id,
      url: 'https://api.xero.com/connections',
      accessToken: company.tokens.accessToken,
    });
    return data;
  }

  async getTrackingCategories(company: Company) {
    const { data }: any = await this.editService.callFunction('getXeroAPI', {
      companyID: company.id,
      url: TRACKING_CATEGORIES,
      accessToken: company.tokens.accessToken,
      tenantID: company.tokens.tenantID,
    });
    return data.TrackingCategories;
  }

  async getInvoices(company: Company) {
    const { data }: any = await this.editService.callFunction('getXeroAPI', {
      companyID: company.id,
      url: INVOICES,
      accessToken: company.tokens.accessToken,
      tenantID: company.tokens.tenantID,
    });
    return data?.Invoices;
  }

  async getCustomers(company: Company) {
    const { data }: any = await this.editService.callFunction('getXeroAPI', {
      companyID: company.id,
      url: CUSTOMERS,
      accessToken: company.tokens.accessToken,
      tenantID: company.tokens.tenantID,
    });
    return data?.Contacts;
  }

  async syncCustomers(
    company: Company,
    customers: XeroContact[]
  ): Promise<XeroContact[]> {
    const { data }: any = await this.editService.callFunction('putXeroAPI', {
      companyID: company.id,
      url: CUSTOMERS,
      accessToken: company.tokens.accessToken,
      tenantID: company.tokens.tenantID,
      body: { Contacts: customers },
    });
    return data?.Contacts;
  }

  async updateInvoice(company: Company, invoice) {
    const { data }: any = await this.editService.callFunction('putXeroAPI', {
      companyID: company.id,
      url: INVOICES,
      accessToken: company.tokens.accessToken,
      tenantID: company.tokens.tenantID,
      body: invoice,
    });
    return data?.Invoices;
  }

  private static handleError(error: HttpErrorResponse): any {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
          `body was: ${JSON.stringify(error.error)}`
      );
    }
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    );
  }
  private static log(message: string): any {
    console.log(message);
  }
}
