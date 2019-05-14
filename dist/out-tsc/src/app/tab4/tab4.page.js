import * as tslib_1 from "tslib";
import { Component } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import { HttpClient } from "@angular/common/http";
var Tab4Page = /** @class */ (function () {
    function Tab4Page(http, fireStore) {
        this.http = http;
        this.fireStore = fireStore;
        this.searchQuery = '';
        this.plantSpecies = [];
    }
    Tab4Page.prototype.ngOnInit = function () { };
    Tab4Page.prototype.checkAPI = function ($event, autoQuery) {
        if (autoQuery.length >= 1) {
            var searchQuery = autoQuery;
        }
        else {
            var searchQuery = $event.srcElement.value;
        }
        this.searchQuery = searchQuery;
        this.speciesSelected = false;
        this.plantSpecies = [];
        if (searchQuery.length > 2) {
            console.log('Running API for ' + searchQuery + '...');
            this.plantSearch(searchQuery);
        }
        else {
            console.log('Query length is too short.');
            this.doneLoading = true;
        }
    };
    Tab4Page.prototype.displayPlantBase = function (result, searchQuery) {
        var _this = this;
        var loopValue = result['data'];
        console.log(loopValue.length + ' PLANT SPECIES DETECTED ');
        console.log(loopValue);
        loopValue.forEach(function (eachObj) {
            console.log(eachObj);
            if (eachObj['Symbol']) {
                var imgAddress = eachObj['Symbol'] + '_001_shp.jpg';
                _this.plantSpecies.push(eachObj);
            }
        });
    };
    Tab4Page.prototype.plantSearch = function (searchQuery) {
        // TREFLE APP
        //
        // this.http.get('http://trefle.io/api/plants?q=' + searchquery).subscribe(
        // result => {
        //   console.log(result)
        // });
        //
        var _this = this;
        this.http.get('https://plantsdb.xyz/search?Common_Name=' + searchQuery + '&limit=100').subscribe(function (result) {
            _this.displayPlantBase(result, searchQuery);
        }, function (error) {
            _this.http.get('https://plantsdb.xyz/search?Genus=' + searchQuery + '&limit=100').subscribe(function (result) {
                _this.displayPlantBase(result, searchQuery);
            }, function (error) {
                _this.http.get('https://plantsdb.xyz/search?Species=' + searchQuery + '&limit=100').subscribe(function (result) {
                    _this.displayPlantBase(result, searchQuery);
                }, function (error) {
                    _this.http.get('https://plantsdb.xyz/search?Family=' + searchQuery + '&limit=100').subscribe(function (result) {
                        _this.displayPlantBase(result, searchQuery);
                    }, function (error) {
                        console.log("ALL MATCHES FAILED ON NAME, SPECIES, GENUS & FAMILY");
                        _this.plantSpecies = [];
                        _this.doneLoading = true;
                    });
                });
            });
        });
    };
    Tab4Page = tslib_1.__decorate([
        Component({
            selector: 'app-tab4',
            templateUrl: 'tab4.page.html',
            styleUrls: ['tab4.page.scss']
        }),
        tslib_1.__metadata("design:paramtypes", [HttpClient,
            AngularFirestore])
    ], Tab4Page);
    return Tab4Page;
}());
export { Tab4Page };
//# sourceMappingURL=tab4.page.js.map