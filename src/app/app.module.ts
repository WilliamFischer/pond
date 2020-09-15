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
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { Camera } from '@ionic-native/camera/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { ActionSheet, ActionSheetOptions } from '@ionic-native/action-sheet/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

// import { AddShopModalPage } from './add-shop-modal/add-shop-modal.page'
// import { ShopDetailModelPage } from './shop-detail-model/shop-detail-model.page'
// import { AddVariationModelPage} from './add-variation-model/add-variation-model.page'

import { SelectTankSubstratePage } from './modal/select-tank-substrate/select-tank-substrate.page'

import { LoadingController } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Firebase
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { FirestoreSettingsToken } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireStorageModule } from '@angular/fire/storage';

import { FormsModule } from '@angular/forms';

import { OrderModule } from 'ngx-order-pipe';

// Providers
import { AuthProvider } from './providers/auth/auth';
import { ApiProvider } from './providers/api/api';

// Directives
import { ImagePreloadDirectiveDirective } from './image-preload-directive.directive';


@NgModule({
  declarations: [
    AppComponent,
    SelectTankSubstratePage,
    ImagePreloadDirectiveDirective
  ],
  entryComponents: [
    SelectTankSubstratePage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot({
      mode: 'ios'
    }),
    AppRoutingModule,
    AngularFireModule.initializeApp({
      apiKey: "AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ",
      authDomain: "pond-b8861.firebaseapp.com",
      databaseURL: "https://pond-b8861.firebaseio.com",
      projectId: "pond-b8861",
      storageBucket: "pond-b8861.appspot.com",
      messagingSenderId: "761650598572",
      appId: "1:761650598572:web:d99d69b31c1eec780ac509",
      measurementId: "G-VXR4B124HE"
    }),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    HttpClientModule,
    FormsModule,
    OrderModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    LoadingController,
    AuthProvider,
    ApiProvider,
    Geolocation,
    Facebook,
    GooglePlus,
    Camera,
    Keyboard,
    NavigationBar,
    HTTP,
    ScreenOrientation,
    ActionSheet,
    PhotoViewer,
    InAppBrowser,
    { provide: FirestoreSettingsToken, useValue: {} },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
