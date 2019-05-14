import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AngularFireAuth } from '@angular/fire/auth';
var Tab5Page = /** @class */ (function () {
    function Tab5Page(router, afAuth) {
        this.router = router;
        this.afAuth = afAuth;
    }
    // Route the user back to the login page
    //
    Tab5Page.prototype.logout = function () {
        var _this = this;
        console.log('Logging out...');
        this.afAuth.auth.signOut().then(function () {
            _this.router.navigateByUrl('/login');
        });
    };
    Tab5Page = tslib_1.__decorate([
        Component({
            selector: 'app-tab5',
            templateUrl: 'tab5.page.html',
            styleUrls: ['tab5.page.scss']
        }),
        tslib_1.__metadata("design:paramtypes", [Router,
            AngularFireAuth])
    ], Tab5Page);
    return Tab5Page;
}());
export { Tab5Page };
//# sourceMappingURL=tab5.page.js.map