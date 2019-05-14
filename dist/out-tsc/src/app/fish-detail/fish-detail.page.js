import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
var FishDetailPage = /** @class */ (function () {
    function FishDetailPage(route) {
        this.route = route;
        this.route.params.subscribe(function (param) {
            console.log(param);
        });
    }
    FishDetailPage.prototype.ngOnInit = function () {
    };
    FishDetailPage = tslib_1.__decorate([
        Component({
            selector: 'app-fish-detail',
            templateUrl: './fish-detail.page.html',
            styleUrls: ['./fish-detail.page.scss'],
        }),
        tslib_1.__metadata("design:paramtypes", [ActivatedRoute])
    ], FishDetailPage);
    return FishDetailPage;
}());
export { FishDetailPage };
//# sourceMappingURL=fish-detail.page.js.map