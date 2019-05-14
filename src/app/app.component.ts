import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { Router } from '@angular/router';

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
    private afAuth: AngularFireAuth
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      //** AUTH LOGIN CHECKER **//
      this.afAuth.authState.subscribe(auth=>{
        if(!auth){
          this.router.navigateByUrl('/login');
        }else{
          var currentUser = localStorage.getItem('auth');
          if(!currentUser){
            console.log('setting to localStorage')
            localStorage.setItem('auth', this.afAuth.auth.currentUser.uid);
          }
          this.router.navigateByUrl('/tabs');
        }
      });

    });
  }
}
