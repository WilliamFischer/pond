import { Injectable } from '@angular/core';

// Providers
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

// Native
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';


@Injectable()
export class AuthProvider {

  constructor(
    private afAuth: AngularFireAuth,
    private fb: Facebook,
    private googlePlus: GooglePlus
  ){}

  // FACEBOOK HANDLER
  loginWithFacebook(){
    console.log("LOGIN WITH FACEBOOK ON DEVICE");

    return this.fb.login(['email','public_profile'])
    .then( response => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(response.authResponse.accessToken);

      return firebase.auth().signInAndRetrieveDataWithCredential(facebookCredential)
   })
  }

  loginWithLegacyFacebook(){
    console.log("LOGIN WITH FACEBOOK ON BROWSER");

    var provider = new firebase.auth.FacebookAuthProvider();
    return this.afAuth.auth.signInWithRedirect(provider);
  }


  // GOOGLE HANDLER
  loginWithGoogle(){
    console.log("LOGIN WITH GOOGLE ON DEVICE");

    return this.googlePlus.login({})
    .then( response => {
      let credientials = String(response.idToken);
      console.log(credientials)

      const googleCredential = firebase.auth.GoogleAuthProvider
      .credential(credientials);

      return firebase.auth().signInAndRetrieveDataWithCredential(googleCredential)
   }, error => {
     console.log(error);
   })
  }

  loginWithLegacyGoogle(){
    console.log("LOGIN WITH GOOGLE ON BROWSER")
    var provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.auth.signInWithRedirect(provider);
  }

}
