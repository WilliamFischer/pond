import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FishDetailPage } from './fish-detail.page';
var routes = [
    {
        path: '',
        component: FishDetailPage
    }
];
var FishDetailPageModule = /** @class */ (function () {
    function FishDetailPageModule() {
    }
    FishDetailPageModule = tslib_1.__decorate([
        NgModule({
            imports: [
                CommonModule,
                FormsModule,
                IonicModule,
                RouterModule.forChild(routes)
            ],
            declarations: [FishDetailPage]
        })
    ], FishDetailPageModule);
    return FishDetailPageModule;
}());
export { FishDetailPageModule };
//# sourceMappingURL=fish-detail.module.js.map