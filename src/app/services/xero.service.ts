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

  getConnections(company: Company) {
    this.refreshAccessToken(company.tokens.refreshToken).subscribe(
      async (data: any) => {
        if (data) {
          company.tokens = {
            ...company.tokens,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            lastUpdated: new Date(),
          };
          await this.editService.updateDoc('company', company.id, company);
          console.log('tokens updated');
          this.http
            .get(
              'https://api.xero.com/connections',
              this.authHeader(company.tokens.accessToken)
            )
            .pipe(catchError(XeroService.handleError))
            .subscribe(async (tenants) => {
              if (tenants) {
                company.tokens = {
                  ...company.tokens,
                  tenantID: tenants[0].tenantId,
                  tenantName: tenants[0].tenantName,
                };
                await this.editService.updateDoc(
                  'company',
                  company.id,
                  company
                );
                console.log('tentant updated');
              }
            });
        }
      }
    );
  }

  refreshAccessToken(refreshToken: string) {
    const HTTP_OPTIONS = {
      headers: new HttpHeaders({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': 'application/x-www-form-urlencoded',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        Authorization:
          'Basic ' +
          btoa(environment.clientID + ':' + environment.clientSecret),
      }),
    };
    const BODY = new HttpParams()
      .set('grant_type', 'refresh_token')
      .set('refresh_token', refreshToken);

    return this.http
      .post(API_URL, BODY, HTTP_OPTIONS)
      .pipe(catchError(XeroService.handleError));
  }

  getTrackingCategories(company: Company) {
    return this.http
      .get(TRACKING_CATEGORIES, {
        headers: {
          Authorization: `Bearer ${company.tokens.accessToken}`,
          'Xero-tenant-id': company.tokens.tenantID,
        },
      })
      .pipe(catchError(XeroService.handleError));
  }

  getInvoices(company: Company) {
    return this.http
      .get(INVOICES, {
        headers: {
          Authorization: `Bearer ${company.tokens.accessToken}`,
          'Xero-tenant-id': company.tokens.tenantID,
        },
      })
      .pipe(catchError(XeroService.handleError));
  }
  private authHeader(accessToken: string) {
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
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
