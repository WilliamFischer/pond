import * as tslib_1 from "tslib";
import { Injectable } from '@angular/core';
// Providers
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
// Native
import { Facebook } from '@ionic-native/facebook/ngx';
var AuthProvider = /** @class */ (function () {
    function AuthProvider(afAuth, fb) {
        this.afAuth = afAuth;
        this.fb = fb;
    }
    // FACEBOOK HANDLER
    AuthProvider.prototype.loginWithFacebook = function () {
        return this.fb.login(['email', 'public_profile'])
            .then(function (response) {
            var facebookCredential = firebase.auth.FacebookAuthProvider
                .credential(response.authResponse.accessToken);
            return firebase.auth().signInAndRetrieveDataWithCredential(facebookCredential);
        });
    };
    // GOOGLE HANDLER
    AuthProvider.prototype.loginWithGoogle = function () {
        var provider = new firebase.auth.GoogleAuthProvider();
        return this.afAuth.auth.signInWithPopup(provider);
    };
    AuthProvider = tslib_1.__decorate([
        Injectable(),
        tslib_1.__metadata("design:paramtypes", [AngularFireAuth, Facebook])
    ], AuthProvider);
    return AuthProvider;
}());
export { AuthProvider };
//# sourceMappingURL=auth.js.map