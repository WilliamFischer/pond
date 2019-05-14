import * as tslib_1 from "tslib";
import { Component, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';
import { HttpClient } from "@angular/common/http";
var Tab3Page = /** @class */ (function () {
    function Tab3Page(http, fireStore) {
        this.http = http;
        this.fireStore = fireStore;
        this.searchQuery = '';
        this.fbSpecies = [];
        this.ourFish = [];
        this.relatedSpecies = [];
        this.counter = 0;
        this.minSpeciesReturn = 0;
        this.maxSpeciesReturn = 10;
    }
    Tab3Page.prototype.ngOnInit = function () {
        console.clear();
        var slides = document.querySelector('ion-slides');
        if (slides) {
            slides.options = {
                initialSlide: 1,
                speed: 400
            };
        }
    };
    Tab3Page.prototype.checkAPI = function ($event, autoQuery) {
        if (autoQuery.length >= 1) {
            var searchQuery = autoQuery;
        }
        else {
            var searchQuery = $event.srcElement.value;
        }
        this.searchQuery = searchQuery;
        this.speciesSelected = false;
        this.fbSpecies = [];
        this.ourFish = [];
        this.relatedSpecies = [];
        if (searchQuery.length > 2) {
            console.log('Running API for ' + searchQuery + '...');
            this.displayFirebase(searchQuery);
            // this.checkFirebase(searchQuery);
        }
        else {
            console.log('Query length is too short.');
        }
    };
    Tab3Page.prototype.showGenus = function (genus) {
        this.speciesSelected = false;
        this.checkAPI(false, genus);
        this.searchQuery = genus;
    };
    // Access detail page and save selected species
    Tab3Page.prototype.selectSpecies = function (fish, inDB) {
        var _this = this;
        this.speciesSelected = true;
        if (inDB) {
            console.log('Fish Exists');
        }
        else {
            console.log("NEW TO SYSTEM... ADDING");
            this.addToDatabase(fish);
        }
        this.fireStore.doc('Species/' + fish.SpecCode).valueChanges().subscribe(function (values) {
            if (values) {
                console.log(values);
                _this.species = values;
            }
        });
    };
    // Leave detail page and clear selected species
    Tab3Page.prototype.unSelectSpecies = function () {
        this.speciesSelected = false;
    };
    Tab3Page.prototype.nextPage = function () {
        this.minSpeciesReturn = this.minSpeciesReturn + 10;
        this.maxSpeciesReturn = this.maxSpeciesReturn + 10;
        console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);
        this.content.scrollToTop(400);
    };
    Tab3Page.prototype.displayFirebase = function (searchQuery) {
        var _this = this;
        console.log("### CHECKING OUR FIREBASE ###");
        var lowerQuery = searchQuery.toLowerCase();
        if (lowerQuery) {
            this.fireStore.collection('Species').valueChanges().subscribe(function (values) {
                values.forEach(function (eachObj) {
                    if (lowerQuery == eachObj['species'] || lowerQuery == eachObj['genus'] || lowerQuery == eachObj['name']) {
                        console.log(eachObj['name'] + " EXITS IN THE DB!! ");
                        _this.ourFish.push(eachObj);
                    }
                });
                _this.runFishbaseChecker(searchQuery);
            });
        }
    };
    Tab3Page.prototype.displayFishbase = function (result, searchQuery) {
        var _this = this;
        var loopValue = result['data'];
        this.counter = 0;
        console.log(loopValue.length + ' SPECIES DETECTED ');
        console.log(loopValue);
        var arrayLength = 0;
        loopValue.forEach(function (eachObj) {
            if (_this.fbSpecies.length <= 10) {
                _this.getGoogleImages(eachObj);
            }
            else if (_this.fbSpecies.length <= 10) {
                _this.getGoogleImages(eachObj);
            }
            else {
                console.log("TOO MANY SPECIES TO RUN GOOGLE IMAGES");
            }
            if (eachObj['Fresh'] == -1 && eachObj['Saltwater'] == 0) {
                _this.fbSpecies.push(eachObj);
                _this.fbSpecies[arrayLength]['id'] = arrayLength;
                arrayLength = arrayLength + 1;
            }
        });
        this.checkCommNames(searchQuery);
    };
    Tab3Page.prototype.checkCommNames = function (searchQuery) {
        var _this = this;
        console.log("### CHECKING FISHBASE/COMMON NAMES ###");
        this.http.get('https://fishbase.ropensci.org/comnames?ComName=' + searchQuery + '&limit=500').subscribe(function (result) {
            // Handle result
            var loopableResults = result['data'];
            console.log(loopableResults.length + ' RELATED SPECIES DETECTED ');
            // console.log(loopableResults)
            loopableResults.forEach(function (eachObj) {
                var theSpecCode = eachObj['SpecCode'];
                _this.http.get('https://fishbase.ropensci.org/species?SpecCode=' + theSpecCode + '&limit=500').subscribe(function (result) {
                    var pushResults = result['data'][0];
                    if (pushResults['Fresh'] == -1 && pushResults['Saltwater'] == 0) {
                        // console.log(pushResults)
                        _this.relatedSpecies.push(pushResults);
                    }
                    _this.doneLoading = true;
                });
            });
        }, function (error) {
            console.log("ALL MATCHES FAILED ON COMMON NAMES");
            _this.relatedSpecies = [];
            _this.doneLoading = true;
        });
    };
    Tab3Page.prototype.runFishbaseChecker = function (searchQuery) {
        var _this = this;
        console.log("### CHECKING GENERAL FISHBASE ###");
        this.http.get('https://fishbase.ropensci.org/species?FBname=' + searchQuery + '&limit=500').subscribe(function (result) {
            // Handle result
            _this.displayFishbase(result, searchQuery);
        }, function (error) {
            _this.http.get('https://fishbase.ropensci.org/species?Genus=' + searchQuery + '&limit=500').subscribe(function (result) {
                // Handle result
                _this.displayFishbase(result, searchQuery);
            }, function (error) {
                _this.http.get('https://fishbase.ropensci.org/species?Species=' + searchQuery + '&limit=500').subscribe(function (result) {
                    // Handle result
                    _this.displayFishbase(result, searchQuery);
                }, function (error) {
                    console.log("ALL MATCHES FAILED ON SPECIES, GENUS & NAME");
                    _this.fbSpecies = [];
                    _this.checkCommNames(searchQuery);
                });
            });
        });
    };
    Tab3Page.prototype.addToDatabase = function (fish) {
        console.log("### ADDING SPECIES TO DATABASE ###");
        var speciesAddress = this.fireStore.doc('Species/' + fish.SpecCode);
        var commName = '';
        if (fish.FBname) {
            commName = fish.FBname;
        }
        else {
            commName = fish.Genus + " " + fish.Species;
        }
        speciesAddress.set({
            name: commName.toLowerCase(),
            species: fish.Species.toLowerCase(),
            fishBaseImg: fish.PicPreferredName,
            genus: fish.Genus.toLowerCase(),
            comments: fish.Comments,
            dangerous: fish.Dangerous,
            length: fish.Length,
            genCode: fish.GenCode,
            specCode: fish.SpecCode,
            SpeciesRefNo: fish.SpeciesRefNo,
            vulnerability: fish.Vulnerability
        });
        console.log("SPECIES ADDED TO SYSTEM");
    };
    Tab3Page.prototype.plantSearch = function (searchquery) {
    };
    Tab3Page.prototype.getGoogleImages = function (eachObj) {
        var _this = this;
        var searchName;
        // GOOGLE IMAGES SEARCH
        console.log('RUNNING GOOGLE IMAGE SEARCH');
        searchName = eachObj['Genus'] + " " + eachObj['Species'];
        this.http.get('https://www.googleapis.com/customsearch/v1?q=' + searchName + '&searchType=image&num=4&imgSize=medium&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(function (result) {
            var images = [];
            var loopValue = result['items'];
            loopValue.forEach(function (eachObj) {
                images.push(eachObj['link']);
            });
            if (_this.fbSpecies.length == 1) {
                _this.fbSpecies[0]['Pic'] = images;
            }
            else {
                if (_this.fbSpecies[_this.counter]) {
                    _this.fbSpecies[_this.counter]['Pic'] = images;
                }
            }
            _this.counter = _this.counter + 1;
        }, function (error) {
            console.log(error);
        });
    };
    tslib_1.__decorate([
        ViewChild(IonContent),
        tslib_1.__metadata("design:type", IonContent)
    ], Tab3Page.prototype, "content", void 0);
    Tab3Page = tslib_1.__decorate([
        Component({
            selector: 'app-tab3',
            templateUrl: 'tab3.page.html',
            styleUrls: ['tab3.page.scss']
        }),
        tslib_1.__metadata("design:paramtypes", [HttpClient,
            AngularFirestore])
    ], Tab3Page);
    return Tab3Page;
}());
export { Tab3Page };
//# sourceMappingURL=tab3.page.js.map