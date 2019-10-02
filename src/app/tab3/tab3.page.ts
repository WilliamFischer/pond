import { Component, ViewChild } from '@angular/core';
import { IonContent, Platform, AlertController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs/operators';
//import { AddVariationModelPage} from '../add-variation-model/add-variation-model.page';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page {

  @ViewChild(IonContent) content: IonContent;

  debug: boolean = true;
  speciesSelected: boolean;
  doneLoading: boolean;
  showSelectTank: boolean;
  isLoadingNewSpecies: boolean;
  showTankListLoader: boolean;
  showTankQuanityList: boolean;
  showTankListTick: boolean;
  saltwater: boolean;
  speciesLoaded: boolean;
  speciesDataLoaded: boolean;
  popularMode: boolean;
  randomMode: boolean;
  searchingGenus: boolean;
  fullWikiText: boolean;
  loadedLocalSpecies: boolean;
  hideOurFish: boolean;
  fullGenusDescription: boolean;
  littleSearchbar: boolean;
  userOnAndroid: boolean;

  searchQuery: string = '';
  selectedLetter: string = '';

  minSpeciesReturn: number = 0;
  maxSpeciesReturn: number = 10;
  currentQuantity: number;
  currentOrder: number;

  ourFishLength: number;
  fbSpeciesLength: number;
  relatedSpeciesLength: number;

  selectedTempTank: any;
  imgLoaded: any = [];
  popularSpecies : any = [];
  popularSpeciesCollection : any = [];
  randomSpecies : any = [];
  randomSpeciesCollection : any = [];
  variations : any = [];
  image: any = [];
  speciesVunFloored;
  speciesImgArray: any = [];
  relatedSearchResults: any = [];
  finalRelatedSearchResults: any = [];
  shortRelatedPassage: any = [];
  letterCounter: any = [];
  fbSpecies: any = [];
  tempFBSpecies: any = [];
  tempOURSpecies: any = [];
  tempRELATEDSpecies: any = [];
  ourFish: any = [];
  relatedSpecies: any = [];
  fullImageCollection: any = [];
  tanks: any = [];
  toAddToTankSpecies: any;
  coreCollection: any;
  recheckFirebaseDB: any;
  speciesCollection: any;
  speciesImagesCollection: any;
  imageCollection: any;
  recheckerCollection: any;
  viewCountSubscribe: any;
  ourFishCollectionImages: any;
  genusDescription: any;
  activeTankSelect: any;
  googleImageArray: any = [];
  checkIfAlreadyInTankCollection : any;
  detailedFishInformation : any = [];
  planetCatfishInformation: any = [];
  species : any = [{
    name : '',
    species : '',
    genus : '',
  }];

  constructor(
    private http:HttpClient,
    private nativeHttp: HTTP,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private keyboard: Keyboard,
    public loadingController: LoadingController,
    public plt: Platform
  ){}

  ngOnInit() {

    var slides = document.querySelector('ion-slides');

    if(slides){
      slides.options = {
        initialSlide: 1,
        speed: 400
      }
    }

    if (this.plt.is('android')) {
      this.userOnAndroid = true;
    }else{
      this.userOnAndroid = false;
    }

  }


  // COMMANDER
  checkAPI($event, autoQuery){
      this.keyboard.hide();

      if(autoQuery.length >= 1){
        var searchQuery = autoQuery;
      }else{
        var searchQuery = $event.srcElement.value;
      }

      if(searchQuery.length > 2){
        console.clear();
        console.log('Searching with POND...');

        this.littleSearchbar = true;

        this.doneLoading = false;
        this.displayFirebase(searchQuery);


        this.speciesSelected = false;
        this.popularMode = false
        this.randomMode = false;
        this.littleSearchbar = true;

        this.searchQuery = searchQuery;
        this.selectedLetter = null;
        this.loadedLocalSpecies = false;
        this.fbSpecies = [];
        this.ourFish = [];
        this.relatedSpecies = [];
        this.speciesImgArray = [];
        this.googleImageArray = [];
        this.fullImageCollection = [];
        this.species = [];
        this.genusDescription = '';
        this.finalRelatedSearchResults = [];
        this.relatedSearchResults = [];
        this.shortRelatedPassage = '';

        this.clearSwitcher();

      }else{
        this.littleSearchbar = false;
        console.log('Query length is too short.')
      }
  }

  clearSearch(){
    console.log('Clearing Search...')

    this.searchQuery = '';
    this.fbSpecies = [];
    this.ourFish = [];
    this.relatedSpecies = [];
    this.speciesImgArray = [];
    this.googleImageArray = [];
    this.fullImageCollection = [];
    this.species = [];
    this.letterCounter = [];
    this.selectedLetter = '';
    this.genusDescription = '';
    this.finalRelatedSearchResults = [];
    this.relatedSearchResults = [];

    this.speciesSelected = false;
    this.loadedLocalSpecies = false;
    this.littleSearchbar = false;

    //location.reload();
  }


  showGenus(genus){
    this.speciesSelected = false;
    this.checkAPI(false, genus);
    this.searchQuery = genus;
    this.doneLoading = false;
  }

  showSaltWater(){
    this.speciesSelected = false;
    this.doneLoading = false;
    this.saltwater = true;
    this.checkAPI(false, this.searchQuery);
  }

  showFreshWater(){
    this.speciesSelected = false;
    this.doneLoading = false;
    this.saltwater = false;
    this.checkAPI(false, this.searchQuery);
  }

  // Access detail page and save selected species
  selectSpecies(fish, inDB){

    this.speciesImgArray = [];
    this.fullImageCollection = [];
    this.species = [];
    this.speciesSelected = true;

    if(this.debug){
      if(this.randomSpecies['specCode']){
        console.log(this.randomSpecies)
      }else{
        console.log(fish);
      }

    }

    if(this.coreCollection)
    this.coreCollection.unsubscribe();
    if(this.speciesCollection)
    this.speciesCollection.unsubscribe();
    if(this.speciesImagesCollection)
    this.speciesImagesCollection.unsubscribe();
    if(this.recheckerCollection)
    this.recheckerCollection.unsubscribe();
    if(this.recheckFirebaseDB)
    this.recheckFirebaseDB.unsubscribe();
    if(this.ourFishCollectionImages)
    this.ourFishCollectionImages.unsubscribe();

    if(!inDB){
      console.clear();
      this.isItReallyNewTho(fish);
    }else if (inDB && this.randomSpecies['specCode']){
      console.log('########################');
      console.log('Showing existing random fish...');
      this.increaseViewCount(this.randomSpecies, this.randomSpecies['specCode']);
    }else{
      console.log('########################');
      console.log('Showing existing fish...');

      var specCode;

      if(!fish['specCode']){
        specCode = fish['SpecCode']
      }else{
        specCode = fish['specCode']
      }

      this.increaseViewCount(fish, specCode);
    }
  }

  isItReallyNewTho(fish){
    console.log('### VERIFYING FISH IS REALLY NEW ###');

    if(this.debug){
      console.log(fish['SpecCode'])
    }

    this.recheckFirebaseDB = this.fireStore.collection('Species').valueChanges().subscribe(values => {
      //console.log(values);
      var speciesfound;

      values.forEach(eachImg => {
        //console.log(fish['SpecCode'] + ' vs ' + eachImg['specCode']);
        if(fish['SpecCode'] == eachImg['specCode']){
          speciesfound = true;
        }
        //console.log(eachImg['specCode'])
      });

      if(!speciesfound){
        console.log('FISH IS NEW');
        this.recheckFirebaseDB.unsubscribe();
        this.addToDatabase(fish);
      }else{
        console.log('FISH EXITS');
        this.recheckFirebaseDB.unsubscribe();
        this.selectSpecies(fish, true)
      }
    });

  }

  populateSpecies(fish, specCode){
    //console.log('Populating Species ', fish);

    if(this.viewCountSubscribe)
    this.viewCountSubscribe.unsubscribe();

    this.speciesCollection = this.fireStore.doc('Species/' + specCode).valueChanges().subscribe(values => {
      this.species = values;
      //console.log(this.species);

      if(!this.species){
        console.log('Can\'t yet populate species...')
      }else{
        //console.log(fish['Pic'])
        // fish['Pic'].forEach(eachImg => {
        //   this.speciesImgArray.push(eachImg)
        // });

        if(values['vulnerability']){
          this.speciesVunFloored = Math.floor(values['vulnerability']);
        }
      }
    });

    this.localSpeciesDonePopulating();
  }

  increaseViewCount(fish, specCode){
    let speciesAddress = this.fireStore.doc<any>('Species/' + specCode);

    this.viewCountSubscribe = this.fireStore.doc('Species/' + specCode).valueChanges().subscribe(values => {
      speciesAddress.set({
        viewCount: +values['viewCount'] + +1
      },{
        merge: true
      });

      this.populateSpecies(fish, specCode);
    });
  }

  // presentAlert() {
  //   const alertController = document.querySelector('ion-alert-controller');
  //   alertController.componentOnReady();
  //
  //   const alert = alertController.create({
  //     header: 'Alert',
  //     subHeader: 'Subtitle',
  //     message: 'This is an alert message.',
  //     buttons: ['OK']
  //   });
  //   return alert.present();
  // }

  // Leave detail page and clear selected species
  unSelectSpecies(){
    // var searchQuery = this.searchQuery;
    // this.clearSearch();
    // this.variations = [];
    // this.checkAPI(null, searchQuery);
    console.clear();
    this.speciesSelected = false;
    this.showTankListTick = false;
    this.googleImageArray = [];
    this.fullImageCollection = [];
  }

  nextPage(){
    this.minSpeciesReturn = this.minSpeciesReturn + 11;
    this.maxSpeciesReturn = this.maxSpeciesReturn + 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);


    if(this.relatedSpecies.length > 1){
      this.hideOurFish = true;

      var slicedRelatedSpecies = this.relatedSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

      slicedRelatedSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesReturn && obj['id'] <= this.maxSpeciesReturn){
          this.getGoogleImages(obj)
          //console.log('generated')
        }else{
          //console.log('not generated')
        }
      });
    }

    if(this.fbSpecies.length > 1){
      this.hideOurFish = true;

      var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

      slicedSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesReturn && obj['id'] <= this.maxSpeciesReturn){
          this.getGoogleImages(obj)
          //console.log('generated')
        }
      });
    }

    this.content.scrollToTop(400);
  }

  previousPage(){
    this.minSpeciesReturn = this.minSpeciesReturn - 11;
    this.maxSpeciesReturn = this.maxSpeciesReturn - 10;

    this.hideOurFish = true;

    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    if(this.relatedSpecies.length > 1){
      var slicedRelatedSpecies = this.relatedSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

      slicedRelatedSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesReturn && obj['id'] <= this.maxSpeciesReturn){
          this.getGoogleImages(obj)
          console.log('generated')
        }else{
          console.log('not generated')
        }
      });
    }

    if(this.fbSpecies.length > 1){
      var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

      slicedSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesReturn && obj['id'] <= this.maxSpeciesReturn){
          this.getGoogleImages(obj)
          console.log('generated')
        }else{
          console.log('not generated')
        }
      });
    }

    this.content.scrollToTop(400);
  }


  displayFirebase(searchQuery){
    console.log("### CHECKING OUR FIREBASE ###")

    var lowerQuery = searchQuery.toLowerCase();
    if(lowerQuery){

      // GET CONTENT
      this.coreCollection = this.fireStore.collection('Species').valueChanges().subscribe(
      values => {

        values.forEach(eachObj => {
          if(eachObj['name'].includes(lowerQuery) || eachObj['genus'].includes(lowerQuery)  || eachObj['species'].includes(lowerQuery) ){
            if(!this.saltwater){
              if(eachObj['fresh'] == -1){
                this.ourFish.push(eachObj);
              }
            }else{
              if(eachObj['fresh'] != -1){
                this.ourFish.push(eachObj);
              }
            }

          }
        });

        if(this.ourFish.length){
          // this.populateFirebaseImages(searchQuery);

          this.loadedLocalSpecies = true;

          this.runFishbaseChecker(searchQuery);
        }else{
          //console.log('no local species')
          this.runFishbaseChecker(searchQuery);
        }

        this.checkFavourites(this.ourFish);
      });
    }

  }

  // populateFirebaseImages(searchQuery){
  //   console.log("### LOADING IMAGES FROM OUR FIREBASE ###")
  //
  //   var fishCount = 0;
  //
  //   this.ourFish.forEach(value => {
  //     var images = [];
  //
  //     this.ourFishCollectionImages = this.fireStore.collection('Species/' + value['specCode'] + '/Pic').valueChanges().subscribe(
  //       eachObj => {
  //       eachObj.forEach(urlObj => {
  //         images.push(urlObj['url']);
  //       });
  //     });
  //
  //     this.ourFish[fishCount]['Pic'] = images;
  //     fishCount++;
  //   });
  //
  //   console.log(this.ourFish);
  // }

  displayFishbase(result, searchQuery){
    var loopValue = result['data']
    var arrayLength = 0;
    var speciesArray = [];
    this.image = [];

    if(this.debug){
      console.log(loopValue);
    }

    loopValue.forEach(eachObj => {

      if(!this.ourFish || this.ourFish.length == 0){
        if(!this.saltwater){
          if(eachObj['Fresh'] == -1){
            speciesArray.push(eachObj);
            speciesArray[arrayLength]['id'] = '';
          }
        }else{
          if(eachObj['Fresh'] != -1){
            speciesArray.push(eachObj);
            speciesArray[arrayLength]['id'] = '';
          }
        }
      }else{
        // CHECK THAT SPECIES ISNT ALREADY LISTED
        this.ourFish.forEach(ourFish => {
          if(ourFish['specCode'] == eachObj['SpecCode']){}else{
            speciesArray.push(eachObj);
            speciesArray[arrayLength]['id'] = '';
          }
        });
      }
    });


    var clearOfDups = this.removeDuplicatesBy(x => x.SpecCode, speciesArray);

    //console.log(clearOfDups);

    if(clearOfDups){
      clearOfDups.forEach(function(value, key) {
        //console.log(key, value)
        clearOfDups[key]['id'] = key;
      });

      clearOfDups.forEach(eachObj => {
        if(eachObj['id'] <= 10){
          this.getGoogleImages(eachObj)
          //console.log('Images Generated');
        }else{
          //console.log('not generated')
        }

      });


      setTimeout(()=>{
        this.fbSpecies = clearOfDups;
        this.checkCommNames(searchQuery);
        this.generateGenusDescription();
      });

    }


  }


  // CHECK API AGAINST THE COMMON FISHBASE DATABASE
  checkCommNames(searchQuery){
    console.log("### CHECKING FISHBASE/COMMON NAMES ###")

    this.http.get('https://fishbase.ropensci.org/comnames?ComName=' + searchQuery + '&limit=500').subscribe(
        result => {
          // Handle result
          var loopableResults = result['data'];

          var clearOfDups = this.removeDuplicatesBy(x => x.SpecCode, loopableResults);
          //console.log(clearOfDups);


          // CHECK IF SPECIES IS IN OUR DB OR THE MAIN FISHBASE DB
          // this.fbSpecies.forEach(speciesObj => {
          //   this.relatedSpeciesDisplay(speciesObj, eachObj);
          // });

          var key = 0;

          clearOfDups.forEach(subSpecies => {
              key++
              this.populateRelatedSpecies(subSpecies, key)
          });

          let coreInt = setInterval(()=>{
            //console.log(this.relatedSpecies);

            if(this.relatedSpecies.length >= 1){
              clearInterval(coreInt);

              this.areYouSureTheseArentInTheDatabase();

              setTimeout(()=>{
                let scope = this;

                //console.log(this.relatedSpecies)
                if(this.relatedSpecies){
                  console.log('### GENERATING RELATED IMAGES ###');

                  this.relatedSpecies.forEach(function(value, key) {
                    //console.log(key, value)
                    scope.relatedSpecies[key]['id'] = key;
                  });

                  this.relatedSpecies.forEach(eachObj => {
                    if(eachObj['id'] <= 10){
                      this.getGoogleImages(eachObj)
                    }
                  });

                  if(this.debug){
                    console.log('All Images Generated');
                  }
                }
              });
            }else{
              clearInterval(coreInt);

              console.log("ALL MATCHES FAILED ON COMMON NAMES");
              this.relatedSpecies = [];
              this.areYouSureTheseArentInTheDatabase();
            }

          }, 1000);

        }, error => {
          console.log("ALL MATCHES FAILED ON COMMON NAMES");
          this.relatedSpecies = [];
          this.areYouSureTheseArentInTheDatabase();
    });


  }


  populateRelatedSpecies(subSpecies, key){
    let scope = this;

    if(this.fbSpecies.length >= 1){
      this.fbSpecies.forEach(function(mainSpecies, key) {

        // CHECK THAT SPECIES ISNT ALREADY LISTED IN MAIN DB
        if(subSpecies['SpecCode'] != mainSpecies['SpecCode']){

          if(scope.ourFish.length >= 1){
            // CHECK THAT SPECIES ISNT ALREADY LISTED IN OUR DB
            scope.ourFish.forEach(ourFish => {
              //console.log(ourFish['specCode'] + " VS " + subSpecies['SpecCode'])
              if(ourFish['specCode'] == subSpecies['SpecCode']){}else{
                scope.getFullFishResult(subSpecies, key, true);
              }
            });
          }else{
            scope.getFullFishResult(subSpecies, key, true);
          }

        }else{}

      });
    }else{
      //console.log("No main species to check related species against.")

      if(this.ourFish.length >= 1){
        // CHECK THAT SPECIES ISNT ALREADY LISTED IN OUR DB
        this.ourFish.forEach(function(ourFish, key) {
          if(ourFish['specCode'] == subSpecies['SpecCode']){}else{
            scope.getFullFishResult(subSpecies, key, true);
          }
        });
      }else{
        console.log("No local species to check related species against.")

        this.getFullFishResult(subSpecies, key, false);
      }
    }




  }

  removeDuplicatesBy(keyFn, arr){
    var mySet = new Set();
    return arr.filter(function(x) {
      var key = keyFn(x), isNew = !mySet.has(key);
      if (isNew) mySet.add(key);
      return isNew;
    });
  }

  getFullFishResult(species, key, isFound){
    var theSpecCode = species['SpecCode']

    this.http.get('https://fishbase.ropensci.org/species?SpecCode=' + theSpecCode + '&limit=1').subscribe(
      result => {
        var pushResults = result['data'][0];

        //console.log("Getting full result for " + pushResults['Species'])

        if(!this.saltwater){
          if(pushResults['Fresh'] == -1 && pushResults['Species'] !== 'rasbora'){
            this.relatedSpecies.push(pushResults);
            if(this.relatedSpecies[key])
            this.relatedSpecies[key]['id'] = '';
          }
        }else{
          if(pushResults['Fresh'] != -1){
            this.relatedSpecies.push(pushResults);
            if(this.relatedSpecies[key])
            this.relatedSpecies[key]['id'] = '';
          }
        }

      });
  }

  // generateRelatedImages(){
  //   console.log('### GENERATING RELATED IMAGES ###');
  //   var counter = 0;
  //
  //   this.relatedSpecies.forEach(relatedFish => {
  //     //console.log(counter);
  //
  //     if(counter <= 10){
  //       this.getGoogleImages(relatedFish);
  //     }
  //
  //     counter++;
  //   });
  //
  //   console.log('Images Generated');
  //
  //   this.maybeWikipediaWillSaveUs();
  //
  // }


  areYouSureTheseArentInTheDatabase(){
    console.log("### REPOPULATING LOCAL SPECIES ###");

    setTimeout(()=>{
        this.recheckerCollection = this.fireStore.collection('Species').valueChanges().subscribe(values => {
          values.forEach(localSpecies => {
            //this.ourFish.forEach(ourFishSpecies => {

              this.fbSpecies.forEach(species => {
                if(localSpecies['specCode'] == species['SpecCode']){
                  this.ourFish.push(localSpecies);
                  // if(!this.saltwater){
                  //   if(localSpecies['fresh'] == -1){
                  //     this.pushOurFishSpecies(localSpecies);
                  //   }
                  // }else{
                  //   if(localSpecies['fresh'] != -1){
                  //     this.pushOurFishSpecies(localSpecies);
                  //   }
                  // }
                }
              });

              if(this.relatedSpecies.length < 1){
                this.relatedSpecies.forEach(species => {
                  if(localSpecies['specCode'] == species['SpecCode']){
                    this.ourFish.push(localSpecies);
                    // console.log('HELLO THATS THE SAME BRO')
                    // if(!this.saltwater){
                    //   if(localSpecies['fresh'] == -1){
                    //     this.pushOurFishSpecies(localSpecies);
                    //   }
                    // }else{
                    //   if(localSpecies['fresh'] != -1){
                    //     this.pushOurFishSpecies(localSpecies);
                    //   }
                    // }
                  }
                });
              }

          });
        });

    });

    setTimeout(()=>{
      if(this.ourFish.length >= 1){

        if(this.debug){
          console.log(this.ourFish)
        }

        this.loadedLocalSpecies = true;
        // this.populateFirebaseImages(this.searchQuery);
        this.removeOurDuplicates();

        this.removeOurFishfromExternalSpecies();
      }else{
        console.log('Nope, no local species im sure of it!')

        console.log(this.ourFish);
        console.log(this.fbSpecies);
        console.log(this.relatedSpecies);

        if(this.ourFish.length == 0 && this.relatedSpecies.length == 0 && this.fbSpecies.length == 0){
          this.maybeWikipediaWillSaveUs();
        }else{
          this.everythingsTruelyDone();
        }

      }
    }, 1500);




  }

  removeOurFishfromExternalSpecies(){
    ('### REMOVING ANY LOCAL FISH FROM FISHBASE ###')

    this.ourFish.forEach(myfish => {

      this.fbSpecies.forEach(fbfish => {
        if(fbfish['SpecCode'] == myfish['specCode']){
          var num = fbfish['id'];
          this.fbSpecies[num] = '';
        }
      });

      this.relatedSpecies.forEach(relatedfish => {
        if(relatedfish['SpecCode'] == myfish['specCode']){
          var num = relatedfish['id'];
          this.relatedSpecies[num] = '';
        }
      });

    });
  }

  pushOurFishSpecies(localSpecies){
    this.ourFish.push(localSpecies);
    this.recheckerCollection.unsubscribe();
    // this.ourFish.forEach(myfish => {
    //   if(localSpecies['specCode'] != myfish['specCode']){
    //
    //   }
    // });
  }

  removeOurDuplicates(){
    console.log("### REMOVE FIREBASE REPEATS ###");

    var clearOurFishOfDups = this.removeDuplicatesBy(x => x.specCode, this.ourFish);
    this.ourFish = clearOurFishOfDups

    this.everythingsTruelyDone();

    // setTimeout(()=>{
    //   this.maybeWikipediaWillSaveUs();
    // }, 1000);
  }

  // COMPARE AND DISPLAY RELATED SPECIES
  // relatedSpeciesDisplay(speciesObj, eachObj){
  //   var speciesObject;
  //
  //   if(speciesObj == 'noaccess'){
  //     speciesObject = '12345'
  //   }else{
  //     speciesObject = speciesObj['SpecCode']
  //   }
  //
  //   if(speciesObject != eachObj['SpecCode']){
  //
  //     var theSpecCode = eachObj['SpecCode']
  //     this.http.get('https://fishbase.ropensci.org/species?SpecCode=' + theSpecCode + '&limit=1').subscribe(
  //       result => {
  //         var pushResults = result['data'][0];
  //         var speciesArray = [];
  //
  //         if(this.ourFish.length == 0){
  //           if(pushResults['Fresh'] == -1 && pushResults['Saltwater'] == 0){
  //             speciesArray.push(pushResults);
  //           }
  //         }else{
  //           // CHECK THAT SPECIES ISNT ALREADY LISTED IN OUR DB
  //           this.ourFish.forEach(ourFish => {
  //             console.log(ourFish['specCode'] + " VS " + eachObj['SpecCode'])
  //
  //             if(ourFish['specCode'] == eachObj['SpecCode']){}else{
  //               if(pushResults['Fresh'] == -1 && pushResults['Saltwater'] == 0){
  //                 speciesArray.push(pushResults);
  //               }
  //             }
  //           });
  //         }
  //
  //         this.doneLoading = true;
  //
  //         var clearOfDupsCore = this.removeDuplicatesBy(x => x.SpecCode, speciesArray);
  //         console.log(clearOfDupsCore);
  //
  //     });
  //
  //   }else{}
  //
  // }


  // CHECK API AGAINST FISHBASE
  runFishbaseChecker(searchQuery){
    this.searchingGenus = false;

    console.log("### CHECKING GENERAL FISHBASE ###")
    this.http.get('https://fishbase.ropensci.org/species?Genus=' + searchQuery + '&limit=500').subscribe(
      result => {
        // Found Genus
        this.displayFishbase(result, searchQuery);
        this.searchingGenus = true;
        console.log('Genus found!')
      },
      error => {
        this.http.get('https://fishbase.ropensci.org/species?FBname=' + searchQuery + '&limit=500').subscribe(
          result => {
          // Found Name
          this.displayFishbase(result, searchQuery);
          console.log('Common name of species found!')
          },
          error => {
            this.http.get('https://fishbase.ropensci.org/species?Species=' + searchQuery + '&limit=500').subscribe(
              result => {
                // Found Species
                this.displayFishbase(result, searchQuery);
                console.log('Species found!')
              },
              error => {
                let lastWord =  searchQuery.split(" ").splice(-1);
                this.http.get('https://fishbase.ropensci.org/species?Species=' + lastWord + '&limit=500').subscribe(
                  result => {
                    // Found Species based from last word in string
                    this.displayFishbase(result, searchQuery);
                  },
                  error => {
                    // Everything failed.
                    console.log("ALL MATCHES FAILED ON SPECIES, GENUS & NAME");
                    this.fbSpecies = [];
                    this.checkCommNames(searchQuery);
                });
            });
          });
        });

  }



  // ADD SPECIES TO FIREBASE DATABASE FOR LATER
  addToDatabase(fish){
    console.log("### ADDING SPECIES TO DATABASE ###")

    let speciesAddress = this.fireStore.doc<any>('Species/' + fish.SpecCode);

    var commName;
    var proccessedComments;
    var fishSpecies;
    var fishGenus;
    var fishImgName;

    if(fish.FBname){
      commName = fish.FBname
    }else{
      commName = fish.Genus + " " + fish.Species;
    }

    if(fish.Comments){
      proccessedComments = fish.Comments.replace(/ *\([^)]*\) */g, "").replace(/ *\<[^>]*\) */g, "");
    }else{
      proccessedComments = ''
    }

    if(fish.Species){
      fishSpecies = fish.Species.toLowerCase()
    }else{
      fishSpecies = ''
    }

    if(fish.Genus){
      fishGenus = fish.Genus.toLowerCase()
    }else{
      fishGenus = ''
    }

    if(fish.PicPreferredName){
      fishImgName = fish.PicPreferredName
    }else{
      fishImgName = ''
    }

    //console.log(fish);

    speciesAddress.set({
      name: commName.toLowerCase(),
      species: fishSpecies,
      fishBaseImg: fish.PicPreferredName,
      genus: fishGenus,
      comments: proccessedComments,
      dangerous: fish.Dangerous,
      length: fish.Length,
      genCode: fish.GenCode,
      specCode: fish.SpecCode,
      SpeciesRefNo: fish.SpeciesRefNo,
      vulnerability: fish.Vulnerability,
      viewCount: 0,
      fresh: fish.Fresh
    });

    var specCode = fish['SpecCode']

    //console.log('BASIC FISH INFO SAVED TO DB')
    this.presentNewSpeciesLoading(fish);

    this.getMoreGoogleImages(fish, specCode);

    var populateImgesInt = setInterval(()=>{
      if(this.googleImageArray.length == 10){
        clearInterval(populateImgesInt);
        console.log('### SAVING IMAGES ###')

        // SAVE PHOTOS TO DATABASE
        var speciesAddress = this.fireStore.doc<any>('Species/' + fish.SpecCode);

        speciesAddress.update({
          Pics:this.googleImageArray
        });

        // this.googleImageArray.forEach(eachObj => {
        //   //console.log(eachObj);
        //   var speciesPicArray = this.fireStore.doc<any>('Species/' + fish.SpecCode + "/Pic/" + counter);
        //   speciesPicArray.set({
        //     url: eachObj
        //   })
        //
        //   counter++
        // });

        if(this.coreCollection)
        this.coreCollection.unsubscribe();
        if(this.speciesCollection)
        this.speciesCollection.unsubscribe();
        if(this.speciesImagesCollection)
        this.speciesImagesCollection.unsubscribe();
        if(this.recheckerCollection)
        this.recheckerCollection.unsubscribe();
        if(this.recheckFirebaseDB)
        this.recheckFirebaseDB.unsubscribe();
        if(this.ourFishCollectionImages)
        this.ourFishCollectionImages.unsubscribe();

        //console.log(fish)
        this.theInternetIsMyBitchAndShesBeenABadGirl(fish);
      }
    }, 500);
  }

  plantSearch(searchquery){

  }



  // GENERATE IMAGES FROM GOOGLE FOR CARDS
  getGoogleImages(obj){
    var imageArr = [];

    if (!this.plt.is('mobileweb') && (this.plt.is('ios') || this.plt.is('android'))) {
      //console.log('### GENERATING GENERAL IMAGES ON IOS / ANDROID ###');

      setTimeout(()=>{
        this.nativeHttp.get('https://www.googleapis.com/customsearch/v1?q='+ obj['Genus'] + "%20" + obj['Species'] +'&searchType=image&num=4&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi', {}, {})
          .then(data => {
            var mainData = JSON.parse(data.data);
            //console.log(mainData);

            var loopValue = mainData['items'];

            loopValue.forEach(image => {

              if(image['displayLink'] != 'www.seriouslyfish.com' && image['displayLink'] != 'www.facebook.com'){
                imageArr.push(image['link'])
              }

            });

            obj['Pic'] = imageArr;

          })
          .catch(error => {
            console.log(error)
        });
      });
    }else {
      //console.log('### GENERATING GENERAL IMAGES ON BROWSER ###');

      setTimeout(()=>{
        this.http.get('https://www.googleapis.com/customsearch/v1?q='+ obj['Genus'] + "%20" + obj['Species'] +'&searchType=image&num=4&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
        result => {
          //console.log(result)
          var loopValue = result['items'];

          loopValue.forEach(image => {

            if(image['displayLink'] != 'www.seriouslyfish.com' && image['displayLink'] != 'www.facebook.com'){
              imageArr.push(image['link'])
            }

          });

          obj['Pic'] = imageArr;
        }, error => {
          console.log(JSON.stringify(error));
        });
       });
    }

  }

  // GENERATE IMAGES FROM GOOGLE FOR INDIVIDUAL SPECIES
  getMoreGoogleImages(fish, specCode){
    //console.log(this.googleImageArray);

    // if(fish['genus']){
    //   var searchName = fish['genus'] + " " + fish['species'];
    // }else{
    //var searchName = fish['Genus'] + " " + fish['Species'];
    // }

    //console.log(fish)

    console.log(this.plt);
    if (!this.plt.is('mobileweb') && (this.plt.is('android') || this.plt.is('ios'))) {
      console.log('### GENERATING 10 GOOGLE IMAGES ON IOS/ANROID ###');
      setTimeout(()=>{
        this.nativeHttp.get('https://www.googleapis.com/customsearch/v1?q='+ fish['Genus'] + "%20" + fish['Species'] + '&searchType=image&num=10&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi', {}, {})
          .then(data => {

            var mainData = JSON.parse(data.data);
            //console.log(data.data);

            var loopValue = mainData['items'];

            loopValue.forEach(obj => {
              //console.log(obj);
              this.googleImageArray.push(obj['link']);
            });

          });
        });
    }else{
      console.log('### GENERATING 10 GOOGLE IMAGES ON BROWSER ###');
      setTimeout(()=>{
        this.http.get('https://www.googleapis.com/customsearch/v1?q='+ fish['Genus'] + "%20" + fish['Species'] + '&searchType=image&num=10&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
          result => {
            this.fullImageCollection.push(result['items']);
          }, error => {
            console.log(error)
          }, () => {
          this.fullImageCollection.forEach(eachObj => {
            eachObj.forEach(eachObj2 => {
              // if(eachObj2['link'] && eachObj2['displayLink'] != 'en.wikipedia.org' && eachObj2['displayLink'] != 'www.shutterstock.com' && eachObj2['displayLink'] != 'www.fishbase.us' && eachObj2['displayLink'] != 'www.seriouslyfish.com' && eachObj2['displayLink'] != 'www.facebook.com'){
              //   this.googleImageArray.push(eachObj2['link']);
              // }

              this.googleImageArray.push(eachObj2['link']);
            });

          });
        });
      });
    }
  }


  newLetterSwitcher(letter){
    this.selectedLetter = '';
    this.doneLoading = false;

    this.selectedLetter = letter;
    console.log('Getting results for letter ' + letter);

    this.genusDescription = [];

    //console.log('fishbase species: ', this.fbSpecies )
    //console.log('temp fishbase species: ',this.tempFBSpecies)

    if(this.fbSpecies.length > 1 && this.tempFBSpecies.length < 1){
      console.log('Populating fbspecies temp species...')
      this.tempFBSpecies = this.fbSpecies;
    }else{
      this.fbSpecies = this.tempFBSpecies;
    }

    if(this.ourFish.length > 1 && this.tempOURSpecies.length < 1){
      console.log('Populating our temp species...')
      this.tempOURSpecies = this.ourFish;
    }else{
      this.ourFish = this.tempOURSpecies;
    }

    if(this.relatedSpecies.length > 1 && this.tempRELATEDSpecies.length < 1){
      console.log('Populating related temp species...')
      this.tempRELATEDSpecies = this.relatedSpecies;
    }else{
      this.relatedSpecies = this.tempRELATEDSpecies;
    }

    if(this.ourFish){
      this.populateNewFirebaseSpecies(letter);
    }

    if(this.fbSpecies){
      this.populateNewFishbaseSpecies(letter);
    }

    if(this.relatedSpecies){
      this.populateNewRelatedSpecies(letter);
    }

    if(this.ourFish)
    this.ourFishLength = this.ourFish.length;
    if(this.fbSpecies)
    this.fbSpeciesLength = this.fbSpecies.length;
    if(this.relatedSpecies)
    this.relatedSpeciesLength = this.relatedSpecies.length

    this.doneLoading = true;
  }

  populateNewFirebaseSpecies(letter){
    let fishbaseSpecies = [];
    var counter = 0;

    this.ourFish.forEach(fish => {
      console.log(fish)

      if(fish['species'] && fish['species'].charAt(0) == letter){
        fish['id'] = counter
        fishbaseSpecies.push(fish);

        counter++;
      }

      if(fish['name'] && fish['name'].charAt(0) == letter){
        fish['id'] = counter
        fishbaseSpecies.push(fish);

        counter++;
      }
    });

    console.log(fishbaseSpecies)
    this.ourFish = fishbaseSpecies;

  }

  populateNewFishbaseSpecies(letter){
    let fishbaseSpecies = [];
    var counter = 0;

    this.fbSpecies.forEach(fish => {
      //console.log(fish)
      if(fish['Species'] && fish['Species'].charAt(0) == letter){
        fish['id'] = counter
        fishbaseSpecies.push(fish);
        this.getGoogleImages(fish);

        counter++;
      }

      if(fish['FBname'] && fish['FBname'].charAt(0) == letter){
        fish['id'] = counter
        fishbaseSpecies.push(fish);
        this.getGoogleImages(fish);

        counter++;
      }
    });

    this.fbSpecies = fishbaseSpecies;
  }

  populateNewRelatedSpecies(letter){
    let fishbaseSpecies = [];
    var counter = 0;

    this.relatedSpecies.forEach(fish => {
      //console.log(fish)
      if(fish['Species'] && fish['Species'].charAt(0) == letter){
        fish['id'] = counter
        fishbaseSpecies.push(fish);
        this.getGoogleImages(fish);

        counter++;
      }

      if(fish['FBname'] && fish['FBname'].charAt(0) == letter){
        fish['id'] = counter
        fishbaseSpecies.push(fish);
        this.getGoogleImages(fish);

        counter++;
      }

    });

    var clearOfDups = this.removeDuplicatesBy(x => x.SpecCode, fishbaseSpecies);
    this.relatedSpecies = clearOfDups;
  }

  clearSwitcher(){
    this.selectedLetter = '';
    this.generateGenusDescription();

    if(this.tempFBSpecies){
      this.fbSpecies = this.tempFBSpecies;
      this.tempFBSpecies = '';
    }
    if(this.tempOURSpecies){
      this.ourFish = this.tempOURSpecies;
      this.tempOURSpecies = '';
    }
    if(this.tempRELATEDSpecies){
      var clearOfDups = this.removeDuplicatesBy(x => x.SpecCode, this.tempRELATEDSpecies);
      this.relatedSpecies = clearOfDups;
      this.tempRELATEDSpecies = '';
    }

    if(this.ourFish)
    this.ourFishLength = this.ourFish.length;
    if(this.fbSpecies)
    this.fbSpeciesLength = this.fbSpecies.length;
    if(this.relatedSpecies)
    this.relatedSpeciesLength = this.relatedSpecies.length
  }

  addFishToWishlist(fish){
    console.log('Favouriting Fish...')

    if(fish['isFavourited']){
      fish['isFavourited'] = false;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + fish['specCode']);
      wishlistAddress.delete();

    }else{
      fish['isFavourited'] = true;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + fish['specCode']);

      wishlistAddress.set({
        dateSet: new Date(),
        name: fish['name'],
        specCode: fish['specCode'],
        genus: fish['genus'],
        order: 0,
      },{
        merge: true
      });
    }

  }

  addRandomFishToWishlist(){
    console.log('Favouriting Random Fish...')

    if(this.randomSpecies['isFavourited']){
      this.randomSpecies['isFavourited'] = false;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + this.randomSpecies['specCode']);
      wishlistAddress.delete();
      
    }else{
      this.randomSpecies['isFavourited'] = true;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + this.randomSpecies['specCode']);

      wishlistAddress.set({
        dateSet: new Date(),
        name: this.randomSpecies['name'],
        specCode: this.randomSpecies['specCode'],
        genus: this.randomSpecies['genus'],
        order: 0,
      },{
        merge: true
      });

      console.log(this.randomSpecies)
    }

  }

  addTankTrigger(fish){
    this.showSelectTank = true;
    console.log('Showing tank select...')

    this.toAddToTankSpecies = fish;

    this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
    values =>{
      this.tanks = values;
    });
  }

  addFishToTank(tank){
    this.doesFishExist(tank);
  }

  selectTank(tank){
    this.activeTankSelect = tank;
    this.addFishToTank(tank);
  }

  cancelAddToTank(){
    this.activeTankSelect = '';
    this.selectedTempTank = '';

    this.currentQuantity = 0;
    this.currentOrder = 0;

    this.showTankQuanityList = false;
    this.showTankQuanityList = false;
  }

  doesFishExist(tank){
    this.showTankListTick = false;

    let exists = false;

    this.checkIfAlreadyInTankCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'] + '/species').valueChanges().subscribe(values => {
      values.forEach(species => {
        if(species['name'] == this.toAddToTankSpecies['name']){
          this.currentQuantity = species['quantity'];
          this.currentOrder = species['order'];

          exists = true;
        }
      });

      if(exists){
        console.log('FISH ALREADY EXISTS')
        console.log(this.currentQuantity)
      }else{
        console.log('FISH IS NEW TO TANK ')
        this.populateTankSpecies(tank);
      }

      this.showTankQuanityList = true;
      this.selectedTempTank = tank;
      this.showTankQuanityList = true;

    });

  }

  populateTankSpecies(tank){
    let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'] + '/species/' + this.toAddToTankSpecies['specCode']);

    tankAddress.set({
      dateSet: new Date(),
      name: this.toAddToTankSpecies['name'],
      specCode: this.toAddToTankSpecies['specCode'],
      genus: this.toAddToTankSpecies['genus'],
      order: 0,
      quantity: 1
    },{
      merge: true
    });

    console.log("Species added to tank!")
  }

  setSpeciesTankQuantity(speciesCount){
    this.checkIfAlreadyInTankCollection.unsubscribe();

    this.showTankListLoader = true;

    let quantity;

    if(this.currentQuantity){
      quantity = +speciesCount + +this.currentQuantity
    }else{
      quantity = speciesCount
    }


    let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.selectedTempTank['name'] + '/species/' + this.toAddToTankSpecies['specCode']);

    tankAddress.set({
      quantity: quantity
    },{
      merge: true
    });

    setTimeout(()=>{
      this.showTankListLoader = false;
      this.showTankListTick = true;
    });

    setTimeout(()=>{
      this.activeTankSelect = null;
      this.showTankListLoader = false;
      this.showTankListTick = false;
      this.showTankQuanityList = false;
      this.showSelectTank = false;
      this.selectedTempTank = '';
    });
  }

  hideTankMenu(){
    this.showTankListLoader = false;
    this.showTankListTick = false;
    this.showTankQuanityList = false;
    this.showSelectTank = false;
    this.selectedTempTank = '';
  }

  // selectLetter(letter){
  //   this.letterCounter = [];
  //   this.selectedLetter = letter;
  //   console.log('Searching For all ' + letter + '\'s in ' + this.searchQuery + '')
  //
  //   if(this.fbSpecies.length >= 1){
  //     this.fbSpecies.forEach(species => {
  //       var speciesLetter = species['Species'].charAt(0).toUpperCase();
  //       var nameLetter;
  //
  //       if(species['FBname']){
  //         nameLetter = species['FBname'].charAt(0).toUpperCase();
  //       }else{
  //         nameLetter = '';
  //       }
  //
  //       var selectedLetter = letter.toUpperCase();
  //
  //       if(speciesLetter == selectedLetter || nameLetter == selectedLetter){
  //         this.letterCounter.push(species)
  //       }
  //     });
  //   }
  //
  //   if (this.relatedSpecies.length >= 1){
  //     this.relatedSpecies.forEach(species => {
  //       var speciesLetter = species['Species'].charAt(0).toUpperCase();
  //       var genusLetter = species['Genus'].charAt(0).toUpperCase();
  //       var nameLetter;
  //
  //       if(species['FBname']){
  //         nameLetter = species['FBname'].charAt(0).toUpperCase();
  //       }else{
  //         nameLetter = '';
  //       }
  //
  //       var selectedLetter = letter.toUpperCase();
  //
  //       if(speciesLetter == selectedLetter || genusLetter == selectedLetter || nameLetter == selectedLetter){
  //         this.letterCounter.push(species)
  //       }
  //     });
  //   }
  //
  //   console.log(this.letterCounter);
  //
  //   this.letterCounter.forEach(obj => {
  //     this.getGoogleImages(obj);
  //   });
  //
  // }
  //
  // clearLetter(){
  //   this.letterCounter = [];
  //   this.selectedLetter = '';
  // }

  // async addVariation(species){
  //   console.log('Opening Variation Model')
  //   const showAddVariationModal = await this.modalCtrl.create({
  //    component: AddVariationModelPage,
  //    componentProps: { species: species }
  //  });
  //
  //  return await showAddVariationModal.present();
  // }

  getVariations(species){
    var specCode = species['specCode'];

    this.fireStore.collection('Species/' + specCode + "/Variations").valueChanges().subscribe(values => {
      this.variations = values;
    });

  }


  theInternetIsMyBitchAndShesBeenABadGirl(species){
    console.log('### RUNNING SERIOUSLY FISH WEB SCRAPER ###');
    //console.log(species)

    if(species['species']){
      var searchParam = species['genus'] + '-' + species['species'];
      //console.log('Searching for ' + searchParam);
    }else if(species['Species']){
      var searchParam = species['Genus'] + '-' + species['Species'];
      //console.log('Searching for ' + searchParam);
    }else{
      //console.log('Scraper failed to load species...')
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=https://www.seriouslyfish.com/species/'+searchParam+'/&xpath=p');
    if(this.debug){
      console.log('running on ' + scraperURL)
    }

    this.http.get(corsFix + scraperURL).subscribe(
      result => {

        var res = [];
        for (var x in result){
           result.hasOwnProperty(x) && res.push(result[x])
        }

        var detailedFishInformation = []

        if(this.debug){
          console.log('### OUTPUT ###')
          console.log(res);
        }


        res.forEach(function(value, key) {

          if(value['text'].includes('Sorry, we couldn\'t find the page you were looking for.')){
            console.log('SERIOUSLY FISH CANNOT FIND THIS SPECIES');
          }else{
            //console.log('FISH FOUND');


            if(value['text'].includes('Temperature')){
              // console.log('--- Temperature of species: ---');
              // console.log(value['text']);
              var temp = value['text'].replace('Temperature:','').replace('C','').replace('&deg;','').replace('&deg;','').replace('&#8211;','-');
              detailedFishInformation['temperature'] = temp;
            }

            if(value['text'].includes('pH:')){
              // console.log('--- PH of species: ---');
              // console.log(value['text']);
              var ph = value['text'].replace('pH:','').replace('&deg;','').replace('&#8211;','-');
              detailedFishInformation['ph'] = ph;
            }

            if(value['text'].includes('Hardness:')){
              // console.log('--- Hardness of species: ---');
              // console.log(value['text']);
              var hard = value['text'].replace('Hardness:','').replace('&deg;','').replace('ppm','').replace('&#8211;','-').replace(/\s/g,'');
              detailedFishInformation['hardness'] = hard;
            }

            if(value['text'].includes('Size:') || value['text'].includes('body length')){
              // console.log('--- Size of species: ---');
              // console.log(value['text']);
              detailedFishInformation['size'] = value['text'];
            }

            if(value['text'].includes('base dimensions') || value['text'].includes('An aquarium measuring') || value['text'].includes('An aquarium with a base measuring') || value['text'].includes('can be kept in a tank')){
              // console.log('--- Recommended Tank Size of species: ---');
              // console.log(value['text']);
              var tankSize = value['text'].replace('#8243;','\"').replace('#8211;','-').replace('&Lowast;','*').trim();
              detailedFishInformation['tankSize'] = tankSize;
            }

            if(value['text'].includes('Nigeria') || value['text'].includes('Guinea') || value['text'].includes('Brazil') ){
              // console.log('--- Recommended Tank Size of species: ---');
              // console.log(value['text']);
              var loc = value['text'].replace('&#Xe9;','é')
              detailedFishInformation['locality'] = loc;
            }

            if(value['text'].includes('best kept with')){
              // console.log('--- Recommended Tank Size of species: ---');
              // console.log(value['text']);
              detailedFishInformation['tankMates'] = value['text'];
            }

            if(value['text'].includes('Has been bred in aquaria') || value['text'].includes('spawning') || value['text'].includes('spawn')){
              // console.log('--- Recommended Tank Size of species: ---');
              // console.log(value['text']);
              detailedFishInformation['repoduction'] = value['text'];
            }

            if(value['text'].includes('Other decor can include') || value['text'].includes('Well planted with')){
              // console.log('--- Recommended Tank Size of species: ---');
              // console.log(value['text']);
              detailedFishInformation['enviroment'] = value['text'];
            }

            if(value['text'].includes('Also known as')){
              // console.log('--- Recommended Tank Size of species: ---');
              // console.log(value['text']);
              detailedFishInformation['SFComments'] = value['text'];
            }



            // if(value['text'].includes('substrate')){
            //   // console.log('--- Recommended Substrate of species: ---');
            //   // console.log(value['text']);
            //   detailedFishInformation['substrate'] = value['text'];
            // }

            if(value['text'].includes('Sexually') || value['text'].includes('Quite difficult to sex')){
              // console.log('--- Sexual Identification of species: ---');
              // console.log(value['text']);
              detailedFishInformation['sexIdentification'] = value['text'];
            }

            if(value['text'].includes('inhabits') || value['text'].includes('Exclusively found')){
              // console.log('--- Habitat of species: ---');
              // console.log(value['text']);
              detailedFishInformation['habitat'] = value['text'];
            }

            if(value['text'].includes('Omnivorous')){
              // console.log('--- Habitat of species: ---');
              // console.log(value['text']);
              detailedFishInformation['diet'] = value['text'];
            }

            if(value['text'].includes('stained brownish')){
              // console.log('--- Habitat of species: ---');
              // console.log(value['text']);
              detailedFishInformation['blackWater'] = true;
            }

            if(value['text'].includes('aquatic plants may also be present') || value['text'].includes('Well planted')){
              // console.log('--- Habitat of species: ---');
              // console.log(value['text']);
              detailedFishInformation['aquaticPlants'] = true;
            }
          }
        });

        if(detailedFishInformation['temperature']){
          if(this.debug){
            console.log(detailedFishInformation);
          }
          console.log('SERIOUSLY FISH FOUND SPECIES');
          this.detailedFishInformation = detailedFishInformation
          this.populateDetailedInformation(species);
        }

        this.maybePlanetCatfish(species);

      });
  }

  populateDetailedInformation(species){

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    if(this.detailedFishInformation['temperature']){
      speciesAddress.set({
        temperature:this.detailedFishInformation['temperature']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['ph']){
      speciesAddress.set({
        ph:this.detailedFishInformation['ph']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['hardness']){
      speciesAddress.set({
        hardness:this.detailedFishInformation['hardness']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['size']){
      speciesAddress.set({
        SFFishSize:this.detailedFishInformation['size']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['tankSize']){
      speciesAddress.set({
        recommendedTankSize:this.detailedFishInformation['tankSize']
      },{
        merge: true
      });
    }

    // if(this.detailedFishInformation['substrate']){
    //   speciesAddress.update({
    //     recommendedSubstrate: this.detailedFishInformation['substrate']
    //   });
    // }

    if(this.detailedFishInformation['sexIdentification']){
      speciesAddress.set({
        sexIdentificationFeatures:this.detailedFishInformation['sexIdentification']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['locality']){
      speciesAddress.set({
        locality:this.detailedFishInformation['locality']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['habitat']){
      speciesAddress.set({
        habitat:this.detailedFishInformation['habitat']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['blackWater']){
      speciesAddress.set({
        blackWater:this.detailedFishInformation['blackWater']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['aquaticPlants']){
      speciesAddress.set({
        aquaticPlants:this.detailedFishInformation['aquaticPlants']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['diet']){
      speciesAddress.set({
        diet:this.detailedFishInformation['diet']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['enviroment']){
      speciesAddress.set({
        enviroment:this.detailedFishInformation['enviroment']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['tankMates']){
      speciesAddress.set({
        SFtankMates:this.detailedFishInformation['tankMates']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['repoduction']){
      speciesAddress.set({
        repoduction:this.detailedFishInformation['repoduction']
      },{
        merge: true
      });
    }

    if(this.detailedFishInformation['SFComments']){
      speciesAddress.set({
        SFComments:this.detailedFishInformation['SFComments']
      },{
        merge: true
      });
    }



  }


  maybePlanetCatfish(species){
    console.log('### RUNNING PLANT CATFISH WEB SCRAPER ###');

    if(this.debug){
      console.log(species)
    }

    if(species['species']){
      var searchParam = species['genus'] + '_' + species['species'];
      //console.log('Searching for ' + searchParam);
    }else if(species['Species']){
      var searchParam = species['Genus'] + '_' + species['Species'];
      //console.log('Searching for ' + searchParam);
    }else{
      console.log('Scraper failed to load species...')
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var urlchanger = 'http://expandurl.com/api/v1/?url=https://www.planetcatfish.com/' + searchParam

    //console.log(corsFix + urlchanger)
    this.http.get(corsFix + urlchanger).subscribe(result => {}, error => {
      if(this.debug){
        console.log(error.error['text']);
      }
      var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=' + error.error['text'] +'/&xpath=tr');

      if(this.debug){
        console.log('running on ' + scraperURL)
      }

      this.http.get(corsFix + scraperURL).subscribe(result => {
        if(result){
          this.processPlanetCatfish(result, species);
        }else{
          console.log("PLANT CATFISH CANNOT FIND THIS SPECIES");

          this.searchWikipedia(species);
        }

      }, error => {
        console.log("PLANT CATFISH CANNOT FIND THIS SPECIES");

        this.searchWikipedia(species);
      });
    });

  }

  processPlanetCatfish(result, species){
    if(this.debug){
      console.log(result)
    }

    var planetCatfishInformation = [];

    result.forEach(eachTxt => {
      // console.log(eachTxt['text'])

      if(eachTxt['text'].includes('pH')){
        var processedPH = eachTxt['text'].replace('pH','').trim();
        // console.log('pH: ' + processedPH)
        planetCatfishInformation['ph'] = processedPH;
      }

      if(eachTxt['text'].includes('Locality')){
        var processedLoc = eachTxt['text'].replace('Locality:','').replace('Type Locality', '').trim();
        // console.log('Locality: ' + processedLoc)
        planetCatfishInformation['locality'] = processedLoc;
      }

      if(eachTxt['text'].includes('Common Name')){
        var processedName = eachTxt['text'].replace('Common Names','').trim();
        // console.log('Common Name: '+ processedName)
        planetCatfishInformation['commonName'] = processedName;
      }

      if(eachTxt['text'].includes('Etymology')){
        var processedEty = eachTxt['text'].replace('Etymology','').replace('&nbsp;','').trim();
        // console.log('Etymology: '+ processedEty)
        planetCatfishInformation['etymology'] = processedEty;
      }

      if(eachTxt['text'].includes('Size')){
        var processedSize = eachTxt['text'].replace('Size','').replace('&quot;', "\"").replace('Find near, nearer or same sized spp.', '').trim();
        // .substring(0, 14);
        //console.log('Size: ' + processedSize)
        planetCatfishInformation['size'] = processedSize;
      }

      if(eachTxt['text'].includes('Identification')){
        var processedId = eachTxt['text'].replace('Identification','').trim();
        // console.log('Identification: ' + processedId)
        planetCatfishInformation['identification'] = processedId;
      }

      if(eachTxt['text'].includes('Sexing')){
        var processedSex = eachTxt['text'].replace('Sexing','').trim();
        // console.log('Sexing: ' + processedSex)
        planetCatfishInformation['sexing'] = processedSex;
      }

      if(eachTxt['text'].includes('Distribution')){
        var processedDis = eachTxt['text'].replace('Distribution','').replace(/\(click on these areas to find other species found there\)/g, '').replace('Log in to view species occurence data on a map.', '').trim();
        // console.log('Distribution: '+ processedDis)
        planetCatfishInformation['distribution'] = processedDis;
      }

      if(eachTxt['text'].includes('Feeding')){
        var processedFeed = eachTxt['text'].replace('Feeding','').trim();
        // console.log('Feeding: '+ processedFeed)
        planetCatfishInformation['feeding'] = processedFeed;
      }

      if(eachTxt['text'].includes('Furniture')){
        var processedFurniture = eachTxt['text'].replace('Furniture','').trim();
        // console.log('Furniture: '+ processedFurniture)
        planetCatfishInformation['furniture'] = processedFurniture;
      }

      if(eachTxt['text'].includes('Compatibility')){
        var processedCompat = eachTxt['text'].replace('Compatibility','').trim();
        // console.log('Compatibility: '+ processedCompat)
        planetCatfishInformation['compatibility'] = processedCompat;
      }

      if(eachTxt['text'].includes('Suggested Tankmates')){
        var processedTankMates = eachTxt['text'].replace('Suggested Tankmates','').trim();
        // console.log('Suggested Tankmates: '+ processedTankMates)
        planetCatfishInformation['tankMates'] = processedTankMates;
      }

      if(eachTxt['text'].includes('Temperature')){
        var processedTemp = eachTxt['text'].replace('Temperature','').replace(/&deg;/g, '°').replace('(Show species within this range)', '');
        // console.log('Temperature: '+ processedTemp)
        planetCatfishInformation['temp'] = processedTemp;
      }
    });

    console.log('PLANET CATFISH FOUND SPECIES');

    if(this.debug){
      console.log(planetCatfishInformation);
    }

    this.planetCatfishInformation = planetCatfishInformation
    this.generatePlanetCatfishInfo(species);


    // if(value['text'].includes('Nigeria') || value['text'].includes('Guinea')){
    //   // console.log('--- Recommended Tank Size of species: ---');
    //   // console.log(value['text']);
    //   detailedFishInformation['locality'] = value['text'];
    // }

  }

  generatePlanetCatfishInfo(species){

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }
    //console.log(speciesAddress);

    if(this.debug){
      console.log(this.planetCatfishInformation);
    }

    if(this.planetCatfishInformation['ph']){
      speciesAddress.set({
        ph:this.planetCatfishInformation['ph']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['locality']){
      speciesAddress.set({
        locality:this.planetCatfishInformation['locality']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['etymology']){
      speciesAddress.set({
        etymology:this.planetCatfishInformation['etymology']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['size']){
      speciesAddress.set({
        size:this.planetCatfishInformation['size']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['identification']){
      speciesAddress.set({
        identification:this.planetCatfishInformation['identification']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['sexing']){
      speciesAddress.set({
        sexing:this.planetCatfishInformation['sexing']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['distribution']){
      speciesAddress.set({
        distribution:this.planetCatfishInformation['distribution']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['feeding']){
      speciesAddress.set({
        feeding:this.planetCatfishInformation['feeding']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['furniture']){
      speciesAddress.set({
        furniture:this.planetCatfishInformation['furniture']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['compatibility']){
      speciesAddress.set({
        compatibility:this.planetCatfishInformation['compatibility']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['tankMates']){
      speciesAddress.set({
        tankMates:this.planetCatfishInformation['tankMates']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['temp']){
      speciesAddress.set({
        temperature:this.planetCatfishInformation['temp']
      },{
        merge: true
      });
    }

    this.searchWikipedia(species);
  }

  checkAustralianLaws(species){

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    console.log('### CHECKING AUSTRALIAN FISH LAWS... ###')
    if(this.debug){
      console.log(species)
    }
    this.http.get('https://api.myjson.com/bins/1a49s1').subscribe(
    result => {
      if(this.debug){
        console.log(result)
      }


      var rules = [];

      for(var i in result){
        //console.log(result[i])
        let taxon = result[i].Taxon.toLowerCase();
        //let commonName = result[i]["Common Name "].toLowerCase();
        var genus = species['Genus'].toLowerCase();

        if(taxon.includes(genus)){
          taxon.replace('Spp.', 'All species of' + species.genus)

          rules.push(taxon)
        }
      }

      //console.log(rules);

      if(rules.length != 0){
        speciesAddress.update({
          rules:rules
        });
      }

    });

    this.fuckItCheckNorway(species)
    //this.maybeWikipediaWillSaveUs();
  }

  fuckItCheckNorway(species){
    var searchQuery = species['Species'].toLowerCase();
    console.log("### GETTING NORWEGIAN SEA WATER RESULTS ###")

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var userURL = 'http://motyar.info/webscrapemaster/api/?url=http://www.seawater.no/fauna/chordata/'+ searchQuery +'.html&xpath=//div[@id=article]/p[1]#vws';
    var userURL1 = 'http://motyar.info/webscrapemaster/api/?url=http://www.seawater.no/fauna/chordata/'+ searchQuery +'.html&xpath=//div[@id=article]/p[2]#vws';
    var userURL2 = 'http://motyar.info/webscrapemaster/api/?url=http://www.seawater.no/fauna/chordata/'+ searchQuery +'.html&xpath=//div[@id=article]/p[3]#vws';
    var scraperURL = encodeURIComponent(userURL);
    var scraperURL1 = encodeURIComponent(userURL1);
    var scraperURL2 = encodeURIComponent(userURL2);

    if(this.debug){
      console.log(userURL)
    }

    this.http.get(corsFix + scraperURL).subscribe(
    result => {
      if(result){
        if(this.debug){
          console.log(result);
        }

        if(this.debug){
          console.log('character:')
          console.log(result[0]['text']);
        }

        speciesAddress.set({
          norChar: result[0]['text']
        },{
          merge: true
        });
      }

      this.http.get(corsFix + scraperURL1).subscribe(
      result => {
        if(result){
          if(this.debug){
            console.log('habitat:')
            console.log(result[0]['text']);
          }

          speciesAddress.set({
            norHabit: result[0]['text']
          },{
            merge: true
          });
        }

        this.http.get(corsFix + scraperURL2).subscribe(
        result => {
          if(result){
            if(this.debug){
              console.log('Distribution:')
              console.log(result[0]['text']);
            }

            speciesAddress.set({
              norDist: result[0]['text']
            },{
              merge: true
            });
          }

          this.iMeanAtThisPointItMightBeAFuckinShark(species)
        }, error => {
          console.log(error);
          this.iMeanAtThisPointItMightBeAFuckinShark(species)
        });
      }, error => {
        console.log(error);
        this.iMeanAtThisPointItMightBeAFuckinShark(species)
      });

    }, error => {
      console.log(error);
      this.iMeanAtThisPointItMightBeAFuckinShark(species)
    });

  }

  iMeanAtThisPointItMightBeAFuckinShark(species){

    var searchQuery = species['Genus']+"-"+species['Species'];
    console.log("### CHECKING SHARK REFERNCES RESULTS ###")

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var userURL = 'http://motyar.info/webscrapemaster/api/?url=https://shark-references.com/species/view/'+ searchQuery +'&xpath=//div[@id=content]/div/div#vws';
    var scraperURL = encodeURIComponent(userURL);

    if(this.debug){
      console.log(userURL)
    }

    this.http.get(corsFix + scraperURL).subscribe(
    result => {
      let allResults;

      if(this.debug){
        console.log(result)
      }

      allResults = result;

      if(allResults){
        allResults.forEach(eachRes => {

          if(eachRes['text'].includes('Short Description')){
            speciesAddress.set({
              sharkDesc: eachRes['text'].replace('Short Description', '').replace(/\s*\(.*?\)\s*/g, '').replace(/ *\[[^\]]*]/, '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Distribution')){
            speciesAddress.set({
              sharkDist: eachRes['text'].replace('Distribution', '').replace(/\s*\(.*?\)\s*/g, '').replace(/ *\[[^\]]*]/, '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Biology')){
            speciesAddress.set({
              sharkBio: eachRes['text'].replace('Biology', '').replace(/\s*\(.*?\)\s*/g, '').replace(/ *\[[^\]]*]/, '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Size / Weight / Age')){
            speciesAddress.set({
              sharkSize: eachRes['text'].replace('Size / Weight / Age', '').replace(/\s*\(.*?\)\s*/g, '').replace(/ *\[[^\]]*]/, '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Habitat')){
            speciesAddress.set({
              sharkHabitat: eachRes['text'].replace('Habitat', '').replace(/\s*\(.*?\)\s*/g, '').replace(/ *\[[^\]]*]/, '').trim()
            },{
              merge: true
            });
          }

        });

        if(this.saltwater){
          this.howAboutReefLifeSurvey(species)
        }else{
          this.newSpeciesDonePopulating(species)
        }

      }else{
        if(this.saltwater){
          this.howAboutReefLifeSurvey(species)
        }else{
          this.newSpeciesDonePopulating(species)
        }
      }



    }, error => {
      //console.log(error);
      if(this.saltwater){
        this.howAboutReefLifeSurvey(species)
      }else{
        this.newSpeciesDonePopulating(species)
      }
    });


  }

  newSpeciesDonePopulating(fish){
    console.log("DONE - WRAPPING UP & SHOWING NEW SPECIES...")


    if(this.coreCollection)
    this.coreCollection.unsubscribe();
    if(this.speciesCollection)
    this.speciesCollection.unsubscribe();
    if(this.speciesImagesCollection)
    this.speciesImagesCollection.unsubscribe();
    if(this.recheckerCollection)
    this.recheckerCollection.unsubscribe();
    if(this.recheckFirebaseDB)
    this.recheckFirebaseDB.unsubscribe();

    setTimeout(()=>{
      this.speciesLoaded = true;
      this.speciesDataLoaded = true;
      this.dismissNewSpeciesLoading();

      if(this.debug){
        console.log(fish)
      }
      this.selectSpecies(fish, true);
    });

  }

  maybeWikipediaWillSaveUs(){
    console.log('### CHECKING FOR RELATED WORDS ###')

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var userUrl = 'https://api.bing.com/osjson.aspx?query=' + this.searchQuery;
    var scraperURL = encodeURIComponent(userUrl);

    //console.log(corsFix + scraperURL);
    //console.log(userUrl);

    this.http.get(corsFix + scraperURL).subscribe(
      result => {

        if(this.debug){
          console.log(result);
        }

        if(result){
          this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&redirects=1&titles=' + result[1][0]).subscribe(
            result2 => {
              var wikiLink = result2['query'].pages;

              if(this.debug){
                console.log(wikiLink)
              }

              for (var i in wikiLink) {
                var extract = wikiLink[i].extract

                if(!extract){
                  console.log('Species couldn\'t be located on Wikipedia');
                  this.everythingsTruelyDone();
                }else{
                  this.relatedSearchResults = extract;
                  this.everythingsTruelyDone();
                }

                if(result[1][0]){
                  this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exsentences=1&exlimit=1&titles=' + result[1][0]).subscribe(
                  result3 => {
                    var wikiLink2 = result3['query'].pages;

                    if(this.debug){
                      console.log(wikiLink2)
                    }

                    for (var i in wikiLink2) {
                      var extract = wikiLink2[i].extract
                      this.shortRelatedPassage = extract;
                      console.log(extract);
                    }

                    setTimeout(()=>{
                      this.checkPageForRelatedResult(result3)
                    }, 500);
                  });
                }

              }

            });

        }

    }, error => {
      if(this.debug){
        console.log(error)
        console.log('Wikipedia got nothing');
      }

      this.everythingsTruelyDone();
    });
  }

  checkPageForRelatedResult(result3){

    var species = document.getElementsByTagName('li');

    var speciesArray = [];

    Array.prototype.slice.call(species)
    .forEach((sp) => {

      var finalSp = sp.textContent.replace(',', '').replace('Genus', '').trim();

      if(speciesArray.length <= 20 && finalSp.length >= 1 && finalSp !== 'Media related to Cirrhitidae at Wikimedia Commons'){
        let coreHTML = sp.innerHTML
        let regex = '(?!>)([^><]+)(?=<\/i>)'

        let newSp = coreHTML.match(regex)
        //console.log(newSp[1]);

        if(newSp && newSp[1]){
          speciesArray.push(newSp[1]);
        }

      }

    });

    this.finalRelatedSearchResults = speciesArray;

    if(this.debug){
      console.log(this.finalRelatedSearchResults);
    }

    var foundSp = document.getElementsByClassName('didYouMeanResults');

    console.log(foundSp)
    var innerText = foundSp[0]['children'][1]['innerText'];

    if(this.debug){
      console.log(innerText)
    }

    var init = innerText.indexOf('(');
    var fin = innerText.indexOf(')');
    var matchedText = innerText.substr(init+1,fin-init-1);

    if(matchedText){
      if(this.debug){
        console.log(matchedText)
      }

      this.finalRelatedSearchResults = []
      this.finalRelatedSearchResults.push(matchedText);
    }

  }

  everythingsTruelyDone(){
    setTimeout(()=>{
      if(this.coreCollection)
      this.coreCollection.unsubscribe();
      if(this.speciesCollection)
      this.speciesCollection.unsubscribe();
      if(this.recheckerCollection)
      this.recheckerCollection.unsubscribe();
      if(this.speciesImagesCollection)
      this.speciesImagesCollection.unsubscribe()
      if(this.recheckFirebaseDB)
      this.recheckFirebaseDB.unsubscribe();

      // this.fbSpecies = this.fbSpecies;
      // this.relatedSpecies = this.relatedSpecies;
      // this.ourFish = this.ourFish;


      console.log('everythings done...')

      if(this.ourFish)
      this.ourFishLength = this.ourFish.length;
      if(this.fbSpecies)
      this.fbSpeciesLength = this.fbSpecies.length;
      if(this.relatedSpecies)
      this.relatedSpeciesLength = this.relatedSpecies.length;

      this.content.scrollToTop(400);
      this.doneLoading = true;
    });
  }

  localSpeciesDonePopulating(){
    this.speciesLoaded = true;
    this.speciesDataLoaded = true;
    this.dismissNewSpeciesLoading();

    console.log('everythings done...')

    this.content.scrollToTop(400);
    this.doneLoading = true;
  }

  async presentNewSpeciesLoading(fish) {
    this.isLoadingNewSpecies = true;

    let genus = fish['Genus'].charAt(0).toUpperCase() + fish['Genus'].slice(1);
    let species = fish['Species'].charAt(0).toUpperCase() + fish['Species'].slice(1);

    return await this.loadingController.create({
      message: genus + ' ' + species + ' is new to Pond! Adding to system...'
    }).then(a => {
      a.present().then(() => {
        //console.log('presented');
        this.doneLoading = true;
        if (!this.isLoadingNewSpecies) {
          a.dismiss().then(() => console.log('abort presenting'));
        }
      });
    });
  }

  async dismissNewSpeciesLoading() {
    this.isLoadingNewSpecies = false;
    return await this.loadingController.dismiss();
  }

//   async presentNewSpeciesLoading() {
//     const loading = await this.loadingController.create({
//       message: 'This species is new! Adding to system...'
//     });
//     await loading.present();
// }


  searchWikipedia(fish){
    console.log('### GETTING WIKIPEDIA DESCRIPTION ###')

    let speciesAddress;

    if(fish['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + fish['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + fish['SpecCode']);
    }

    if(fish['genus']){
      var searchName = fish['genus'] + "  " + fish['species'];
    }else{
      var searchName = fish['Genus'] + " " + fish['Species'];
    }

    //var corsFix = 'https://bypasscors.herokuapp.com/api/?url=';
    this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&indexpageids&redirects=1&titles=' + searchName).subscribe(
      result => {
        var wikiLink = result['query'].pages;
        //console.log(wikiLink)

        for (var i in wikiLink) {
          var extract = wikiLink[i].extract;

          if(!extract){
            console.log('Species couldn\'t be located on Wikipedia')
          }else{
            var title = wikiLink[i].title;

            speciesAddress.update({
              wikiDesc:extract,
              wikiName:title
            });
          }
        }
    }, error => {
      console.log("### WIKIPEDIA FAILED... CHECKING GENUS ###")
      this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&indexpageids&redirects=1&titles=' + fish['genus']).subscribe(
        result => {
          var wikiLink = result['query'].pages;
          console.log(wikiLink)

          for (var i in wikiLink) {
            var extract = wikiLink[i].extract;

            if(!extract){
              console.log('Genus couldn\'t be located')
            }else{
              var title = wikiLink[i].title;

              speciesAddress.update({
                wikiDesc:extract,
                wikiName:title
              });
            }
          }
      }, error => {
        console.log('### GENUS FAILED ASWELL ###')
      });
    });

    this.tryFishesOfAutralia(fish)
  }

  seeFulText(){
    this.fullWikiText = true;
  }

  seeLessText(){
    this.fullWikiText = false;
  }

  generateGenusDescription(){
    console.log('### GENERATING GENUS DESCRIPTION ####')

    if(this.searchingGenus){

      this.fullGenusDescription = false;

      this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&exsentences=3&redirects=1&titles=' + this.searchQuery).subscribe(
        result => {
          var wikiLink = result['query'].pages;
          console.log(result)

          for (var i in wikiLink) {
            var extract = wikiLink[i].extract;

            if(!extract){
              console.log('Genus couldn\'t be located on Wikipedia')
            }else{
              console.log(extract);

              if(extract.length >= 100){
                this.genusDescription = extract + ' <u>(click for more)</u>';
              }
            }
          }
      }, error => {
        console.log('### ERROR GETTING GENUS DESCRIPTION ####')
      });
    }
  }

  generateFullGenusDescription(){
    if(this.searchingGenus){

      this.fullGenusDescription = true;

      this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exsentences=10&redirects=1&titles=' + this.searchQuery).subscribe(
        result => {
          var wikiLink = result['query'].pages;
          console.log(result)

          for (var i in wikiLink) {
            var extract = wikiLink[i].extract;

            if(!extract){
              console.log('Genus couldn\'t be located on Wikipedia')
            }else{
              this.genusDescription = extract + ' <u>(click for less)</u>';;
            }
          }
      }, error => {
        console.log('### ERROR GETTING GENUS DESCRIPTION ####')
      });
    }
  }

  tryFishesOfAutralia(species){
    let allResults;

    console.log("### GETTING FISHES OF AUSTRALIA RESULTS ###")

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var userURL = 'http://motyar.info/webscrapemaster/api/?url=http://fishesofaustralia.net.au/search?size=50%26q=' + species['Genus'] + '&xpath=//div[@id=content]/div[3]/div/div/ul/a#vws';
    var scraperURL = encodeURIComponent(userURL);
    var currentSpecies = '<i>' + species['Genus'] + ' ' + species['Species'] + '</i>';
    var currentAuthor = '<span>' + species['Author'].replace(/,/g, '').replace('&', '&amp;') + '</span>';

    if(this.debug){
      console.log(userURL)
      console.log('ON ADDRESS http://fishesofaustralia.net.au/search?q=' + species['Genus'])
    }

    this.http.get(corsFix + scraperURL).subscribe(
    result => {

      if(result){

        if(this.debug){
          console.log(result)
        }

        allResults = result;

        let href;

        allResults.forEach(eachRes => {
          if(eachRes['html'].includes(currentSpecies) || eachRes['html'].includes(currentAuthor)){
            console.log("FISHES OF AUSTRALIA FOUND SPECIES")
            href = eachRes['href']

            this.generateFishesOfAustralia(species, href)
          }
        });


        setTimeout(()=>{
          if(!href){
            this.checkAustralianLaws(species);
            console.log("NOTHING FOUND ON FISHES OF AUSTRALIA")
          }
        });
      }else{
        console.log('### SPECIES DOSENT EXIST IN FISHES OF AUSTRALIA ###')
        this.checkAustralianLaws(species);
      }

    }, error => {
      console.log(error)
      console.log('### SPECIES DOSENT EXIST IN FISHES OF AUSTRALIA ###')
      this.checkAustralianLaws(species);
    });

  }


  generateFishesOfAustralia(species, href){

    let allResults;

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=http://fishesofaustralia.net.au' + href + '&xpath=//div[@id=content]/div[3]/div[1]/div/div#vws');

    if(this.debug){
      console.log('ON ADDRESS http://fishesofaustralia.net.au' + href)
      console.log('against ' + href)
    }

    this.http.get(corsFix + scraperURL).subscribe(
    result => {
      if(result){
        if(this.debug){
          console.log(result)
        }

        allResults = result;

        allResults.forEach(eachRes => {
          if(eachRes['text'].includes('Depth:')){
            let depth = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Depth:',"").trim();
            //console.log('DEPTH:')
            //console.log(depth)

            speciesAddress.set({
              ausDepth: depth
            },{
              merge: true
            });
          }
          if(eachRes['text'].includes('Habitat:')){
            let habitat = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Habitat:',"").trim();
            //console.log('HABITAT:')
            //console.log(habitat)

            speciesAddress.set({
              ausHabitat: habitat
            },{
              merge: true
            });
          }
          if(eachRes['text'].includes('Max Size:')){
            let size = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Max Size:',"").trim();
            //console.log('Max Size:')
            //console.log(size)

            speciesAddress.set({
              ausSize: size
            },{
              merge: true
            });
          }
          if(eachRes['text'].includes('Fishing:')){
            let fishing = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Fishing:',"").trim();
            //console.log('Fishing:')
            //console.log(fishing)

            speciesAddress.set({
              ausFishing: fishing
            },{
              merge: true
            });
          }
        })

        this.generateMoreInfoFishesOfAustralia(species, href);

      }else{
        console.log('Species dosen\'t have a summary')
        this.checkAustralianLaws(species);
      }
    }, error => {
      console.log(error)
      console.log('### SPECIES DOSENT EXIST IN FISHES OF AUSTRALIA ###')
      this.checkAustralianLaws(species);
    });

  }

  generateMoreInfoFishesOfAustralia(species, href){
    let allResults;

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=http://fishesofaustralia.net.au' + href +'&xpath=//div[@id=content]/div[2]/div/div/div/div/div[2]/table/tbody/tr#vws');

    if(this.debug){
      console.log('ON ADDRESS http://fishesofaustralia.net.au' + href + '#moreinfo')
    }

    this.http.get(corsFix + scraperURL).subscribe(
    result => {
      if(result){
        if(this.debug){
          console.log(result)
        }

        allResults = result;

        allResults.forEach(eachRes => {
          if(eachRes['html'].includes('<p>Distribution</p>')){
            let dist = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Distribution',"").trim();
            //console.log('DISTRIBUTION:')
            //console.log(dist)

            speciesAddress.set({
              ausDist: dist
            },{
              merge: true
            });
          }

          if(eachRes['html'].includes('<p>Features</p>')){
            let features = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Features',"").trim();
            //console.log('FEATURES:')
            //console.log(features)

            speciesAddress.set({
              ausFeatures: features
            },{
              merge: true
            });
          }

          if(eachRes['html'].includes('<p>Size</p>')){
            let size = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Size',"").trim();
            //console.log('REGULAR SIZE:')
            //console.log(size)

            speciesAddress.set({
              ausRegSize: size
            },{
              merge: true
            });
          }


          if(eachRes['html'].includes('<p>Colour</p>')){
            let color = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Colour',"").trim();
            //console.log('COLOUR:')
            //console.log(color)

            speciesAddress.set({
              ausColour: color
            },{
              merge: true
            });
          }

          if(eachRes['html'].includes('<p>Feeding</p>')){
            let feeding = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Feeding',"").trim();
            //console.log('FEEDING:')
            //console.log(feeding)

            speciesAddress.set({
              ausFeed: feeding
            },{
              merge: true
            });
          }

          if(eachRes['html'].includes('<p>Biology</p>')){
            let biology = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Biology',"").trim();
            //console.log('BIOLOGY:')
            //console.log(biology)

            speciesAddress.set({
              ausBio: biology
            },{
              merge: true
            });
          }
          if(eachRes['html'].includes('<p>Fisheries</p>')){
            let fisheries = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Fisheries',"").trim();
            //console.log('FISHERIES:')
            //console.log(biology)

            speciesAddress.set({
              ausFisheries: fisheries
            },{
              merge: true
            });
          }
          if(eachRes['html'].includes('<p>Conservation</p>')){
            let conserve = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Conservation',"").trim();
            //console.log('CONSERVATION:')
            //console.log(conserve)

            speciesAddress.set({
              ausConserve: conserve
            },{
              merge: true
            });
          }
          if(eachRes['html'].includes('<p>Remarks</p>')){
            let remarks = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Remarks',"").trim();
            //console.log('REMARKS:')
            //console.log(remarks)

            speciesAddress.set({
              ausRemarks: remarks
            },{
              merge: true
            });
          }
          if(eachRes['html'].includes('<p>Similar Species</p>')){
            let similar = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Similar Species',"").trim();
            //console.log('SIMILAR SPECIES:')
            //console.log(similar)

            speciesAddress.set({
              ausSimilar: similar
            },{
              merge: true
            });
          }
          if(eachRes['html'].includes('<p>Etymology</p>')){
            let ety = eachRes['html'].replace(/(<([^>]+)>)/ig,"").replace('Etymology',"").trim();
            //console.log('ETYMOLOGY')
            //console.log(ety)

            speciesAddress.set({
              ausEty: ety
            },{
              merge: true
            });
          }
        })


        this.checkAustralianLaws(species);

      }else{
        console.log('Species dosen\'t have more info')
        this.checkAustralianLaws(species);
      }
    })
  }

  howAboutReefLifeSurvey(species){
    console.log("### GETTING REEF LIFE SURVEY DESCRIPTION RESULTS ###")

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[2]/div[2]#vws');

    if(this.debug){
      console.log('ON ADDRESS https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'])
    }

    this.http.get(corsFix + scraperURL).subscribe(
      result => {
        if(this.debug){
          console.log(result)
        }

        if(result){
          let desc = result[0].text;

          if(desc.length >= 1){
            let speciesAddress;

            if(species['specCode']){
              speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
            }else{
              speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
            }
            //console.log(speciesAddress);

            if(result && desc){
              speciesAddress.set({
                description: desc
              },{
                merge: true
              });

              this.generateReefSurveyMaxSize(species)
            }
          }else{
            console.log("NO REEF SURVEY RESULTS");
            this.newSpeciesDonePopulating(species);
          }
        }else{
          console.log("NO REEF SURVEY RESULTS");
          this.newSpeciesDonePopulating(species);
        }



     }, error => {
       if(this.debug){
         console.log(error)
       }
       console.log("NO REEF SURVEY RESULTS");
       this.newSpeciesDonePopulating(species);
     });

  }

  generateReefSurveyMaxSize(species){

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[3]/div[2]/ul/li[1]#vws');

    this.http.get(corsFix + scraperURL).subscribe(
      result => {
        let size = result[0].text;

        let speciesAddress;

        if(species['specCode']){
          speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
        }else{
          speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
        }
        //console.log(speciesAddress);

        if(result && size){
          speciesAddress.set({
            size: size.replace('Max Size:', '')
          },{
            merge: true
          });
        }else{
          console.log('NO MAX SIZE')
        }

        this.generateReefSurveyHabitat(species)
    });
  }

  generateReefSurveyHabitat(species){
    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[3]/div[2]/ul/li[3]#vws');

    this.http.get(corsFix + scraperURL).subscribe(
      result => {
        let habitat = result[0].text;

        let speciesAddress;

        if(species['specCode']){
          speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
        }else{
          speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
        }
        //console.log(speciesAddress);

        if(result && habitat){
          speciesAddress.set({
            habitat: habitat.replace('Habitat:', '')
          },{
            merge: true
          });
        }else{
          console.log('NO HABITAT')
        }

        this.generateReefSurveyDepth(species);
    });
  }

  generateReefSurveyDepth(species){
    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[3]/div[2]/ul/li[2]#vws');

    this.http.get(corsFix + scraperURL).subscribe(
      result => {
        let depth = result[0].text;

        let speciesAddress;

        if(species['specCode']){
          speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
        }else{
          speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
        }
        //console.log(speciesAddress);

        if(result && depth){
          speciesAddress.set({
            depth: depth.replace('Deptxh:', '')
          },{
            merge: true
          });
        }else{
          console.log('NO HABITAT')
        }

        this.newSpeciesDonePopulating(species);
    });
  }

  loadPopular(){
    this.popularMode = true;
    this.randomMode = false;
    this.popularSpecies = [];
    this.randomSpecies = [];

    let speciesCount = [];
    let species = [];

    this.popularSpeciesCollection = this.fireStore.collection('Species').valueChanges().subscribe(values => {

      values.forEach(eachSpecies => {
        if(this.saltwater){
          if(eachSpecies['fresh'] != -1){
            speciesCount.push(eachSpecies['viewCount']);
            species.push(eachSpecies);
          }
        }else{
          if(eachSpecies['fresh'] == -1){
            speciesCount.push(eachSpecies['viewCount'])
            species.push(eachSpecies);
          }
        }
      });

      var top10 = species.sort((a,b) => b['viewCount']-a['viewCount']).slice(0,10);

      if(this.debug){
        console.log(top10);
      }

      this.popularSpecies = top10;
      this.checkFavourites(top10);
      this.popularSpeciesCollection.unsubscribe();
    });
  }

  unloadAll(){
    this.popularSpecies = [];
    this.popularMode = false;

    this.randomSpecies = [];
    this.randomMode = false;

    console.clear();
  }

  switchPopular(){
    if(this.popularMode){
      this.loadPopular();
    }
  }

  switchSalt(){
    this.checkAPI(false, this.searchQuery);
  }

  loadRandom(){
    this.randomMode = true;
    this.popularMode = false;
    this.popularSpecies = [];
    this.randomSpecies = [];

    let totalSpeciesCount = 0;

    this.randomSpeciesCollection = this.fireStore.collection('Species').valueChanges().subscribe(values => {
      let species = [];

      values.forEach(eachSpecies => {
        species.push(eachSpecies);
      });

      totalSpeciesCount = values.length;

      let randomNumber = Math.floor(Math.random() * (totalSpeciesCount - 0) + 0);

      var theOne = species[randomNumber];

      if(this.debug){
        console.log('GOT SPECIES:')
        console.log(theOne)
      }

      this.randomSpecies = theOne;
      this.randomSpeciesCollection.unsubscribe();
      this.checkFavourites(this.randomSpecies);
    });
  }

  checkFavourites(array){

    this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist').valueChanges().subscribe(values => {

      if(this.randomSpecies.legnth >= 1){
        values.forEach(eachWishlistSpecies => {
          if(this.randomSpecies['specCode'] == eachWishlistSpecies['specCode']){
            this.randomSpecies['isFavourited'] = true
          }
        });
      }else{
        array.forEach(eachSpecies => {
          values.forEach(eachWishlistSpecies => {
            if(eachSpecies['specCode'] == eachWishlistSpecies['specCode']){
              eachSpecies['isFavourited'] = true
            }
          });
        });
      }

    });

  }

}
