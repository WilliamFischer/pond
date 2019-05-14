import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
// Firebase
import { AngularFireAuth } from '@angular/fire/auth';
var AppComponent = /** @class */ (function () {
    function AppComponent(platform, splashScreen, statusBar, router, afAuth) {
        this.platform = platform;
        this.splashScreen = splashScreen;
        this.statusBar = statusBar;
        this.router = router;
        this.afAuth = afAuth;
        this.initializeApp();
    }
    AppComponent.prototype.initializeApp = function () {
        var _this = this;
        this.platform.ready().then(function () {
            _this.statusBar.styleDefault();
            _this.splashScreen.hide();
            //** AUTH LOGIN CHECKER **//
            _this.afAuth.authState.subscribe(function (auth) {
                if (!auth) {
                    _this.router.navigateByUrl('/login');
                }
                else {
                    _this.router.navigateByUrl('/tabs');
                }
            });
        });
    };
    AppComponent = tslib_1.__decorate([
        Component({
            selector: 'app-root',
            templateUrl: 'app.component.html'
        }),
        tslib_1.__metadata("design:paramtypes", [Platform,
            SplashScreen,
            StatusBar,
            Router,
            AngularFireAuth])
    ], AppComponent);
    return AppComponent;
}());
export { AppComponent };
//# sourceMappingURL=app.component.js.map