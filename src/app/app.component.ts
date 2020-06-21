import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { NavigationBar } from '@ionic-native/navigation-bar/ngx';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';

import { Router } from '@angular/router';
import {HttpClient} from "@angular/common/http";

// Firebase
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,
    private afAuth: AngularFireAuth,
    private navigationBar: NavigationBar,
    private keyboard: Keyboard,
    private screenOrientation: ScreenOrientation,
    private http:HttpClient,
    // private wtj : Wtj
  ) {
    this.initializeApp();
  }



  initializeApp() {
    this.platform.ready().then(() => {
      let autoHide: boolean = true;
      this.navigationBar.setUp(autoHide);

      console.log(window.innerWidth);

      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.keyboard.hideFormAccessoryBar(false);

      if (window.location.host.includes('pondtheapp') || window.location.host.includes('8100')) {
      }else{
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
      }

      // var currentUser = localStorage.getItem('auth');
      // if(!currentUser){
      //   console.log('setting to localStorage')
      //   localStorage.setItem('auth', this.afAuth.auth.currentUser.uid);
      // }

      if(window.location.pathname == '/' || window.location.pathname == '/species/undefined' ){
        this.router.navigateByUrl('/tabs');
      }
      console.clear();
      console.log('%c POND v1.0.0 by William Fischer. For Chestnut.', 'color: #add8e6');
    });
  }

}
