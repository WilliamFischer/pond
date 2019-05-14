import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
var Tab2Page = /** @class */ (function () {
    function Tab2Page(modalCtrl, fireStore, afAuth) {
        this.modalCtrl = modalCtrl;
        this.fireStore = fireStore;
        this.afAuth = afAuth;
        this.tank = {
            name: '',
            ph: 0,
            temp: 0,
            size: 0,
            substrate: ''
        };
        this.doneLoadingTanks = false;
    }
    Tab2Page.prototype.ngOnInit = function () {
        var _this = this;
        // Pull Tanks from Database
        this.firestore.
            this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(function (values) {
            _this.tanks = values;
        });
    };
    Tab2Page.prototype.addTank = function () {
        this.addTankMode = true;
    };
    // Submit tank to database
    Tab2Page.prototype.confirmForm = function () {
        this.addTankMode = false;
        console.log(this.tank);
        var tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.tank.name);
        tankAddress.set({
            name: this.tank.name,
            ph: this.tank.ph,
            temp: this.tank.temp,
            size: this.tank.size,
            substrate: this.tank.substrate
        });
        alert('Tank added');
    };
    Tab2Page = tslib_1.__decorate([
        Component({
            selector: 'app-tab2',
            templateUrl: 'tab2.page.html',
            styleUrls: ['tab2.page.scss']
        }),
        tslib_1.__metadata("design:paramtypes", [ModalController,
            AngularFirestore,
            AngularFireAuth])
    ], Tab2Page);
    return Tab2Page;
}());
export { Tab2Page };
//# sourceMappingURL=tab2.page.js.map