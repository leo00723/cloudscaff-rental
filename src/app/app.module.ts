import { DecimalPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  getAnalytics,
  provideAnalytics,
  ScreenTrackingService,
  UserTrackingService,
} from '@angular/fire/analytics';
import { getApp, initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  connectAuthEmulator,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  provideAuth,
} from '@angular/fire/auth';
import {
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  enableMultiTabIndexedDbPersistence,
  getFirestore,
  provideFirestore,
} from '@angular/fire/firestore';
import {
  connectFunctionsEmulator,
  getFunctions,
  provideFunctions,
} from '@angular/fire/functions';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getPerformance, providePerformance } from '@angular/fire/performance';
import {
  getRemoteConfig,
  provideRemoteConfig,
} from '@angular/fire/remote-config';
import {
  connectStorageEmulator,
  getStorage,
  provideStorage,
} from '@angular/fire/storage';
import { FormBuilder, FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { Capacitor } from '@capacitor/core';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { MasterService } from 'src/app/services/master.service';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppState } from './shared/app/app.state';
import { CompanyState } from './shared/company/company.state';
import { RouterState } from './shared/router.state';
import { UserState } from './shared/user/user.state';
import { SplashPage } from './splash/splash.page';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HttpClientModule } from '@angular/common/http';
import { TrialEndedPage } from './trial-ended/trial-ended.page';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NotificationsState } from './shared/notifications/notifications.state';
import { NotificationFlagState } from './shared/notifications/notificationsFlag.state';
import { NotificationService } from './services/notification.service';
import { ScaffoldTableComponent } from './components/scaffold-table/scaffold-table.component';

// let resolvePersistenceEnabled: (enabled: boolean) => void;
// export const persistenceEnabled = new Promise<boolean>((resolve) => {
//   resolvePersistenceEnabled = resolve;
// });
@NgModule({
  declarations: [AppComponent, SplashPage, TrialEndedPage],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAnalytics(() => getAnalytics()),
    provideAuth(() => {
      if (Capacitor.isNativePlatform()) {
        return initializeAuth(getApp(), {
          persistence: indexedDBLocalPersistence,
        });
      } else {
        const auth = getAuth();
        if (environment.useEmulators) {
          connectAuthEmulator(auth, 'http://localhost:9099');
        }
        return auth;
      }
    }),
    provideFirestore(() => {
      const firestore = getFirestore();
      if (environment.useEmulators) {
        connectFirestoreEmulator(firestore, 'localhost', 8081);
      }
      // enableMultiTabIndexedDbPersistence(firestore).then(
      //   () => resolvePersistenceEnabled(true),
      //   () => enableIndexedDbPersistence(firestore)
      // );
      return firestore;
    }),
    provideFunctions(() => {
      const functions = getFunctions();
      if (environment.useEmulators) {
        connectFunctionsEmulator(functions, 'localhost', 5001);
      }
      return functions;
    }),
    provideStorage(() => {
      const storage = getStorage();
      if (environment.useEmulators) {
        connectStorageEmulator(storage, 'localhost', 9199);
      }
      return storage;
    }),
    providePerformance(() => getPerformance()),
    provideMessaging(() => getMessaging()),
    provideRemoteConfig(() => getRemoteConfig()),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      // Register the ServiceWorker as soon as the app is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    NgxsModule.forRoot(
      [
        AppState,
        RouterState,
        UserState,
        CompanyState,
        NotificationsState,
        NotificationFlagState,
      ],
      {
        developmentMode: !environment.production,
      }
    ),
    NgxsLoggerPluginModule.forRoot({ disabled: environment.production }),
    NgxsReduxDevtoolsPluginModule.forRoot({
      disabled: environment.production,
    }),
    HttpClientModule,
    OAuthModule.forRoot(),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    ScreenTrackingService,
    UserTrackingService,
    MasterService,
    NotificationService,
    FormBuilder,
    DecimalPipe,
    FileOpener,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
