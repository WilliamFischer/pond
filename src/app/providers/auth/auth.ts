import { Injectable } from '@angular/core';

// Providers
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';

// Native
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';


@Injectable()
export class AuthProvider {

  constructor(private afAuth: AngularFireAuth, private fb: Facebook) {
  }

  // FACEBOOK HANDLER
  loginWithFacebook(){
    return this.fb.login(['email','public_profile'])
    .then( response => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(response.authResponse.accessToken);

      return firebase.auth().signInAndRetrieveDataWithCredential(facebookCredential)
   })
  }

  // GOOGLE HANDLER
  loginWithGoogle(){

    var provider = new firebase.auth.GoogleAuthProvider();
    return this.afAuth.auth.signInWithPopup(provider);
  }


}
