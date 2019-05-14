import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
// Providers
import { AuthProvider } from '../providers/auth/auth';
var LoginPage = /** @class */ (function () {
    function LoginPage(router, loadingController, authService) {
        this.router = router;
        this.loadingController = loadingController;
        this.authService = authService;
    }
    LoginPage.prototype.ngOnInit = function () {
    };
    // async presentLoading() {
    //   const loading = await this.loadingController.create({
    //     message: 'Logging you in...',
    //     duration: 2000
    //   });
    //   await loading.present();
    //
    //   const { role, data } = await loading.onDidDismiss();
    //
    //   console.log('Loading dismissed!');
    // }
    LoginPage.prototype.facebookLogin = function () {
        // this.presentLoading();
        var _this = this;
        this.authService.loginWithFacebook().then(function (res) {
            console.log("SUCCESS");
            _this.router.navigateByUrl('/tabs');
        }).catch(function (err) {
            alert(err);
        });
    };
    LoginPage.prototype.googleLogin = function () {
        // this.presentLoading();
        var _this = this;
        this.authService.loginWithGoogle().then(function (res) {
            console.log("SUCCESS");
            _this.router.navigateByUrl('/tabs');
        }).catch(function (err) {
            alert(err);
        });
    };
    // Temp solution - route user in without authentication.
    LoginPage.prototype.tempLogin = function () {
        this.router.navigateByUrl('/tabs');
    };
    LoginPage = tslib_1.__decorate([
        Component({
            selector: 'app-login',
            templateUrl: './login.page.html',
            styleUrls: ['./login.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [Router,
            LoadingController,
            AuthProvider])
    ], LoginPage);
    return LoginPage;
}());
export { LoginPage };
//# sourceMappingURL=login.page.js.map