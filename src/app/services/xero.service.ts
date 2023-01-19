import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = 'https://identity.xero.com/connect/token';

@Injectable({
  providedIn: 'root',
})
export class XeroService {
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

  constructor(private http: HttpClient) {}

  getAccessToken(code: string) {
    console.log(code);
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
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', 'https://app.cloudscaff.com/')
      .set('client_id', environment.clientID)
      .set('client_secret', environment.clientSecret);
    return this.http
      .post(API_URL, BODY, HTTP_OPTIONS)
      .pipe(catchError(XeroService.handleError));
  }
}
