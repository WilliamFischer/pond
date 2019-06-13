import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

// Ionic Native
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Facebook } from '@ionic-native/facebook/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { AddShopModalPage } from './add-shop-modal/add-shop-modal.page'
import { ShopDetailModelPage } from './shop-detail-model/shop-detail-model.page'
import { AddVariationModelPage} from './add-variation-model/add-variation-model.page'

import { SelectTankSubstratePage } from './modal/select-tank-substrate/select-tank-substrate.page'

import { LoadingController } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Firebase
import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { FormsModule } from '@angular/forms';

// Providers
import { AuthProvider } from './providers/auth/auth';

@NgModule({
  declarations: [
    AppComponent,
    AddShopModalPage,
    ShopDetailModelPage,
    AddVariationModelPage,
    SelectTankSubstratePage
  ],
  entryComponents: [
    AddShopModalPage,
    ShopDetailModelPage,
    AddVariationModelPage,
    SelectTankSubstratePage
  ],
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
    HttpClientModule,
    FormsModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LoadingController,
    AuthProvider,
    Geolocation,
    Facebook,
    Camera,
    Keyboard,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
