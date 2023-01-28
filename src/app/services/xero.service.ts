/* eslint-disable @typescript-eslint/naming-convention */
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { catchError, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

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
  constructor(private http: HttpClient, public oauthService: OAuthService) {
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

  getConnections(accessToken: string) {
    return this.http
      .get('https://api.xero.com/connections', this.authHeader(accessToken))
      .pipe(catchError(XeroService.handleError));
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
