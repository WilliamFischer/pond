import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
// Ionic Native
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { LoadingController } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
// Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
// Providers
import { AuthProvider } from './providers/auth/auth';
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = tslib_1.__decorate([
        NgModule({
            declarations: [
                AppComponent,
            ],
            entryComponents: [],
            imports: [
                BrowserModule,
                IonicModule.forRoot(),
                AppRoutingModule,
                AngularFireModule.initializeApp({
                    apiKey: "AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ",
                    authDomain: "pond-b8861.firebaseapp.com",
                    databaseURL: "https://pond-b8861.firebaseio.com",
                    projectId: "pond-b8861",
                    storageBucket: "pond-b8861.appspot.com",
                    messagingSenderId: "761650598572"
                }),
                AngularFirestoreModule,
                AngularFireAuthModule,
                HttpClientModule
            ],
            providers: [
                StatusBar,
                SplashScreen,
                LoadingController,
                AuthProvider,
                Facebook,
                { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
            ],
            bootstrap: [AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
export { AppModule };
//# sourceMappingURL=app.module.js.map