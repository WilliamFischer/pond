import { Component, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonContent, Platform } from '@ionic/angular';
import { PlatformLocation } from '@angular/common'

import { Keyboard } from '@ionic-native/keyboard/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs/operators';
//import { AddVariationMo delPage} from '../add-variation-model/add-variation-model.page';
import { LoadingController } from '@ionic/angular';

import { ApiProvider } from '../providers/api/api'

@Component({
  selector: 'search',
  templateUrl: 'search.page.html',
  styleUrls: ['search.page.scss']
})

export class SearchPage {

  @ViewChild(IonContent) content: IonContent;

  debug: boolean = true;
  speciesSelected: boolean;
  doneLoading: boolean;
  showSelectTank: boolean;
  isLoadingNewSpecies: boolean;
  showTankListLoader: boolean;
  showTankQuanityList: boolean;
  showTankListTick: boolean;
  saltwater: boolean = false;
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
  loggedIn: boolean;
  isLNumCatfish: boolean;
  isInApp: boolean;
  hideAutoComplete: boolean;
  showAutoComplete: boolean;
  updatingSpecies: boolean;
  refreshRequired: boolean;
  showPreviousResults: boolean;
  showInstructions: boolean;

  showPondSpecies: boolean = true;
  showFishbaseSpecies: boolean = true;
  showFishbaseRelatedSpecies: boolean = true;

  //Current Species Version
  runningVersion: string = '0.0.5'

  searchQuery: string = '';
  searchQueryController: string = '';
  selectedLetter: string = '';
  amountOfSpecies: string = '';
  currentFamily: string = '';
  urlLetter: string;
  possibleLNum: string;
  typeofTrigger: string = 'freshwater';

  minSpeciesReturn: number = 0;
  maxSpeciesReturn: number = 10;

  minSpeciesRelatedReturn: number = 0;
  maxSpeciesRelatedReturn: number = 10;

  minSpeciesLocalReturn: number = 0;
  maxSpeciesLocalReturn: number = 10;
  amountOfImageToGenerate: number = 5;

  currentQuantity: number;
  currentOrder: number;

  selectedTempTank: any;
  imgLoaded: any = [];
  popularSpecies : any = [];
  randomSpecies : any = [];


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
  tanks: any = [];
  relatedGenus: any = [];
  viewCountSubscribe: any;
  genusDescription: any;
  googleImageArray: any = [];
  detailedFishInformation : any = [];
  planetCatfishInformation: any = [];
  bettaVariations: any = [];
  allLocalFish: any = [];
  toAddToTankSpecies: any;
  sfSpecies: any = [];
  previousResults: any = [];
  usersFound: any = [];
  fullImageCollection: any = [];

  // COLLECTIONS
  coreCollection : any = [];
  popularSpeciesCollection : any = [];
  randomSpeciesCollection : any = [];
  previousReultsCollection: any = [];
  historyCheckerCollection: any = [];
  speciesCollection: any = [];
  speciesImagesCollection: any = [];
  imageCollection: any = [];
  addTankCollection: any = [];
  recheckerCollection: any = [];
  ourFishCollectionImages: any = [];
  favouritesCollection: any = [];
  userBaseCollection: any = [];
  variationsCollection: any = [];
  localFishAutoCompleteCollection: any = [];
  recheckFirebaseDB: any = [];

  species : any = [{
    name : '',
    species : '',
    genus : '',
  }];

  constructor(
    private http:HttpClient,
    private nativeHttp: HTTP,
    private router: Router,
    private route: ActivatedRoute,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    public apiService: ApiProvider,
    private keyboard: Keyboard,
    public loadingController: LoadingController,
    public plt: Platform,
    private photoViewer: PhotoViewer,
    private iab: InAppBrowser,
    public platformLocation: PlatformLocation
  ){

    this.platformLocation.onPopState(() => {
      this.unsubscriber();
    });

  }

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

    this.afAuth.authState.subscribe(auth=>{
      if(auth){
        this.loggedIn = true;
      }else{
        this.loggedIn = false;
      }
    });

    let instuctions = localStorage.getItem('showInstruct')
    if(instuctions && instuctions == 'true'){
      this.showInstructions = false;
    }else{
      this.showInstructions = true;
      localStorage.setItem('showInstruct', 'true')
    }

    this.apiService.clearSearchWatch().subscribe((data:string) => {
      if(data){
        this.clearSearch();
      }
    })

    var queryLoc = location.search.split('search_query=')[1]
    var isSaltwater = location.search.split('saltwater=')[1]

    if(!isSaltwater || isSaltwater == 'false'){
      this.saltwater = false;
    }else{
      this.saltwater = true;
    }

    if(queryLoc){

      if(queryLoc.length >= 1){

        var urlQuery = queryLoc.replace('%20', ' ');

        if(urlQuery.includes('&letter=')){
          this.urlLetter = urlQuery.split('&letter=').pop();
          console.log(this.urlLetter);

          this.genusDescription = '';
          var newUrlQuery = urlQuery.substring(0, urlQuery.indexOf('&'));

          this.searchQuery = newUrlQuery;
          this.searchQueryController = newUrlQuery;
          this.checkAPI(false, newUrlQuery);

        }else{
          this.searchQuery = urlQuery;
          this.searchQueryController = urlQuery;
          this.checkAPI(false, urlQuery);
        }

      }else{
        console.log('Query found, but empty, clearing...');
        this.clearUrlQuery();
      }

    }else{
      console.log('No Query Location, clearing..');
        this.clearUrlQuery();
    }

    // Check if we are on a device

    if (this.plt.url().includes('pondtheapp.com')  || this.plt.url().includes('localhost:8100')) {
      this.isInApp = false;
      console.log('ON POND WEBSITE')
    }else{
      this.isInApp = true;
      console.log('ON MOBILE DEVICE')
    }

  }

  clearUrlQuery(){
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search_query: null},
      queryParamsHandling: 'merge'
    });
  }

  toggleInstructions(){
    this.showInstructions = false;
    localStorage.setItem('showInstruct', 'true')
  }

  refreshSituation(event){
    this.checkAPI(false, this.searchQuery);

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 1500);
  }

  // COMMANDER
  checkAPI($event, autoQuery){
      var searchQuery;

      console.log(searchQuery)

      if(autoQuery.length >= 1){
        searchQuery = autoQuery;
      }else{
        searchQuery = this.searchQueryController
      }


      if(searchQuery.length > 2){

        //console.clear();
        console.log('Searching with POND...');
        this.doneLoading = false;

        //CLEAR EVERYTHING
        this.clearSearch();

        this.littleSearchbar = true;

        this.keyboard.hide();
        this.unsubscriber();

        this.searchQuery = searchQuery;
        this.searchQueryController = searchQuery;

        //SHOW LOCAL SPECIES, IF YOU CAN
        this.displayFirebase(searchQuery);

        if(searchQuery.toLowerCase() == 'betta'){
          this.getAllBettaFish();
        }

        if(searchQuery.length == 4 && searchQuery.charAt(0) == 'l' && !isNaN(searchQuery.charAt(1)) && !isNaN(searchQuery.charAt(2)) && !isNaN(searchQuery.charAt(3))){
          this.isLNumCatfish = true;
          this.generateLNumSpecies(searchQuery);
        }else{
          this.isLNumCatfish = false;
        }

        this.checkUserBase(searchQuery);
      }else{
        this.littleSearchbar = false;
        console.log('Query length is too short.')
        this.clearSearch();
      }
  }

  clearSearch(){
    console.log('Clearing All...')

    this.fbSpecies = [];
    this.ourFish = [];
    this.relatedSpecies = [];
    this.speciesImgArray = [];
    this.googleImageArray = [];
    this.fullImageCollection = [];
    this.species = [];
    this.letterCounter = [];
    this.finalRelatedSearchResults = [];
    this.relatedSearchResults = [];
    this.relatedGenus = [];
    this.popularSpecies = [];
    this.randomSpecies = [];
    this.bettaVariations = [];
    this.usersFound = [];

    this.speciesSelected = false;
    this.loadedLocalSpecies = false;
    this.littleSearchbar = false;
    this.popularMode = false;
    this.randomMode = false;
    this.isLNumCatfish = false;
    this.showAutoComplete = false;
    this.showPreviousResults = false;

    this.currentFamily = '';
    this.searchQuery = '';
    this.selectedLetter = '';
    this.genusDescription = '';
    this.allLocalFish = '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search_query: null, letter: null },
      queryParamsHandling: 'merge'
    });

  }


  showGenus(genus){
    this.speciesSelected = false;
    this.doneLoading = false;

    this.searchQuery = genus;
    this.checkAPI(false, genus);

    setTimeout(()=>{
      this.showAutoComplete = false;
      this.showPreviousResults = false;
    }, 500);

  }

  showSaltWater(){
    this.speciesSelected = false;
    this.doneLoading = false;
    this.saltwater = true;
    this.typeofTrigger = 'saltwater';
    this.checkAPI(false, this.searchQuery);
  }

  showFreshWater(){
    this.speciesSelected = false;
    this.doneLoading = false;
    this.saltwater = false;
    this.typeofTrigger = 'freshwater';
    this.checkAPI(false, this.searchQuery);
  }

  unsubscriber(){
    if(this.coreCollection.length != 0){
      this.coreCollection.unsubscribe();
    }
    if(this.popularSpeciesCollection.length != 0){
      this.popularSpeciesCollection.unsubscribe();
    }
    if(this.randomSpeciesCollection.length != 0){
      this.randomSpeciesCollection.unsubscribe();
    }
    if(this.previousReultsCollection.length != 0){
      this.previousReultsCollection.unsubscribe();
    }
    if(this.historyCheckerCollection.length != 0){
      this.historyCheckerCollection.unsubscribe();
    }
    if(this.speciesCollection.length != 0){
      this.speciesCollection.unsubscribe();
    }
    if(this.speciesImagesCollection.length != 0){
      this.speciesImagesCollection.unsubscribe();
    }
    if(this.imageCollection.length != 0){
      this.imageCollection.unsubscribe();
    }
    if(this.addTankCollection.length != 0){
      this.addTankCollection.unsubscribe();
    }
    if(this.recheckerCollection.length != 0){
      this.recheckerCollection.unsubscribe();
    }
    if(this.ourFishCollectionImages.length != 0){
      this.ourFishCollectionImages.unsubscribe();
    }
    if(this.favouritesCollection.length != 0){
      this.favouritesCollection.unsubscribe();
    }
    if(this.userBaseCollection.length != 0){
      this.userBaseCollection.unsubscribe();
    }
    if(this.variationsCollection.length != 0){
      this.variationsCollection.unsubscribe();
    }
    if(this.localFishAutoCompleteCollection.length != 0){
      this.localFishAutoCompleteCollection.unsubscribe();
    }
    if(this.recheckFirebaseDB.length != 0){
      this.recheckFirebaseDB.unsubscribe();
    }
  }

  ionViewDidEnter(){
    console.log('Are you looking for genus?')
  }

  // Access detail page and save selected species
  selectSpecies(fish, inDB){
    //console.log(fish);

    if(fish['dateSet'] && !fish['genus']){
      console.log('Gathering species based of History');

      let checkSpeciesFromHistory = this.fireStore.doc('Species/' + fish['specCode']).valueChanges().subscribe(values => {
        this.triggerSelect(values, inDB);

        checkSpeciesFromHistory.unsubscribe();
      });

    }else{
      this.triggerSelect(fish, inDB);
    }

  }

  triggerSelect(fish, inDB){
    console.log('Selecting Species ' + fish['genus'] + ' ' + fish['species']);
    //this.allLocalFish = '';

    this.unsubscriber();

    this.speciesImgArray = [];
    this.fullImageCollection = [];
    this.showAutoComplete = false;
    this.showPreviousResults = false;

    if(this.debug){
      if(this.randomSpecies['specCode']){
        console.log(this.randomSpecies)
      }else{
        console.log(fish);
      }
    }

    var specCode;
    if(!fish['specCode']){
      specCode = fish['SpecCode']
    }else{
      specCode = fish['specCode']
    }

    if(!inDB){
      console.clear();
      this.isItReallyNewTho(fish);
    }else{
      console.log('########################');
      console.log('Showing existing fish...');

      if(this.randomSpecies['specCode']){
        console.log('Showing random Species...')

        let newFish = this.randomSpecies;
        let newSpecCode = this.randomSpecies['specCode'];

        this.packageAndShowFish(newFish, newSpecCode);
      }else{
        this.packageAndShowFish(fish, specCode);
      }

    }
  }

  packageAndShowFish(fish, specCode){

    console.log('### PACKAGED SPECIES ###')
    console.log(fish);

    this.checkFishVersionCode(fish);
    this.addToHistory(fish);
    this.checkFavourites(null);

    //this.viewCountSubscribe.unsubscribe();

    if(this.updatingSpecies && fish['viewCount'] >= 1){
      console.log('update and package complete');

      //this.dismissLoading();

      this.updatingSpecies = false;
    }else{
      console.log('package complete');

      //this.dismissLoading();

      //For next round...
      this.updatingSpecies = true;
    }

    let waitForFish = setInterval(()=>{

      if(fish['versionCode'] == this.runningVersion || fish['Modified']){
        clearInterval(waitForFish);

        console.log('HIDE ALL LOADERS. HAPPY WITH VERSION')


        if(!fish['Modified']){
          console.log(fish['versionCode'] + ' VS ' + this.runningVersion);
        }

        if((fish['Modified'] || fish['versionCode'] == this.runningVersion) && (!fish['temperature'] || this.updatingSpecies)){
          console.log('LOAD SPECIES URL ');
          this.router.navigateByUrl('/species/' + specCode);

          this.species = '';
          this.species = fish;
        }else{
          console.log('NOT ENOUGH INFORMATION TO LOAD SPECIES URL ');

          this.packageAndShowFish(fish, specCode);
        }
      }

    }, 500);

    this.increaseViewCount(fish, specCode);
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

  increaseViewCount(fish, specCode){
    console.log('increasing view count..')
    var stopRun = false;

    let speciesAddress = this.fireStore.doc<any>('Species/' + specCode);

    this.viewCountSubscribe = this.fireStore.doc('Species/' + specCode).valueChanges().subscribe(values => {

      if(!stopRun){
        stopRun = true;

        let newSpeciesValue = +values['viewCount'] + +1;

        setTimeout(()=>{

          if(newSpeciesValue){
            speciesAddress.set({
              viewCount: newSpeciesValue
            },{
              merge: true
            }).then(() => {
              if(newSpeciesValue){
                console.log('species has been viewed ' + newSpeciesValue + ' times');
                this.viewCountSubscribe.unsubscribe();
              }
            });
          }


        }, 2000);
      }


    });

  }

  populateSpecies(fish, specCode){
    //console.log('Populating Species ', fish);

    if(this.viewCountSubscribe)
    this.viewCountSubscribe.unsubscribe();

    // this.speciesCollection = this.fireStore.doc('Species/' + specCode).valueChanges().subscribe(values => {
    //   this.species = values;
    //
    //   this.checkFavourites(null);
    //
    //   //console.log(this.species);
    //
    //   if(!this.species){
    //     console.log('Can\'t yet populate species...')
    //   }else{
    //     //console.log(fish['Pic'])
    //     // fish['Pic'].forEach(eachImg => {
    //     //   this.speciesImgArray.push(eachImg)
    //     // });
    //
    //     if(values['vulnerability']){
    //       this.speciesVunFloored = Math.floor(values['vulnerability']);
    //     }
    //   }
    // });

    this.localSpeciesDonePopulating(fish);
  }

  // Leave detail page and clear selected species
  // unSelectSpecies(){
  //   var searchQuery = this.searchQuery;
  //   this.clearSearch();
  //   this.variations = [];
  //   this.checkAPI(null, searchQuery);
  //
  //   console.clear();
  //   this.speciesSelected = false;
  //   this.showTankListTick = false;
  //   this.googleImageArray = [];
  //   this.fullImageCollection = [];
  //
  //   location.reload();
  // }

  nextPage(type){

    if(type == 'local'){
      this.minSpeciesLocalReturn = this.minSpeciesLocalReturn + 11;
      this.maxSpeciesLocalReturn = this.maxSpeciesLocalReturn + 10;
      // this.hideOurFish = true;

      var slicedRelatedSpecies = this.relatedSpecies.slice((this.minSpeciesLocalReturn - 1), (+this.maxSpeciesLocalReturn + 1));

      slicedRelatedSpecies.forEach(obj => {
        if(obj['id'] >= (this.minSpeciesLocalReturn - 1) && obj['id'] <= (+this.maxSpeciesLocalReturn + 1)){
          this.getGoogleImages(obj)
          //console.log('generated')
        }else{
          //console.log('not generated')
        }
      });
    }

    if(type == 'related'){
      this.minSpeciesRelatedReturn = this.minSpeciesRelatedReturn + 11;
      this.maxSpeciesRelatedReturn = this.maxSpeciesRelatedReturn + 10;
      // this.hideOurFish = true;

      var slicedRelatedSpecies = this.relatedSpecies.slice((this.minSpeciesRelatedReturn - 1), (+this.maxSpeciesRelatedReturn + 1));

      slicedRelatedSpecies.forEach(obj => {
        if(obj['id'] >= (this.minSpeciesRelatedReturn - 1) && obj['id'] <= (+this.maxSpeciesRelatedReturn + 1)){
          this.getGoogleImages(obj)
          //console.log('generated')
        }else{
          //console.log('not generated')
        }
      });
    }

    if(type == 'fishbase'){
      this.minSpeciesReturn = this.minSpeciesReturn + 11;
      this.maxSpeciesReturn = this.maxSpeciesReturn + 10;
      // this.hideOurFish = true;

      var slicedSpecies = this.fbSpecies.slice((this.minSpeciesReturn - 1), (+this.maxSpeciesReturn + 1));

      slicedSpecies.forEach(obj => {
        if(obj['id'] >= (this.minSpeciesReturn - 1) && obj['id'] <= (+this.maxSpeciesReturn + 1)){
          this.getGoogleImages(obj)
          //console.log('generated')
        }
      });
    }

    console.log("SHOWING RESULTS " + (this.minSpeciesReturn - 1) + " TO " + (+this.maxSpeciesReturn + 1));
    // this.content.scrollToTop(400);
  }

  previousPage(type){

    // this.hideOurFish = true;
    //
    if(type == 'local'){
      this.minSpeciesLocalReturn = this.minSpeciesLocalReturn + 11;
      this.maxSpeciesLocalReturn = this.maxSpeciesLocalReturn + 10;

      var slicedLocalSpecies = this.ourFish.slice(this.minSpeciesLocalReturn, this.maxSpeciesLocalReturn);

      slicedLocalSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesLocalReturn && obj['id'] <= this.maxSpeciesLocalReturn){
          this.getGoogleImages(obj)
          console.log('generated')
        }else{
          console.log('not generated')
        }
      });
    }

    if(type == 'related'){
      this.minSpeciesRelatedReturn = this.minSpeciesRelatedReturn + 11;
      this.maxSpeciesRelatedReturn = this.maxSpeciesRelatedReturn + 10;

      var slicedRelatedSpecies = this.relatedSpecies.slice(this.minSpeciesRelatedReturn, this.maxSpeciesRelatedReturn);

      slicedRelatedSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesRelatedReturn && obj['id'] <= this.maxSpeciesRelatedReturn){
          this.getGoogleImages(obj)
          console.log('generated')
        }else{
          console.log('not generated')
        }
      });
    }

    if(type == 'fishbase'){
      this.minSpeciesReturn = this.minSpeciesReturn - 11;
      this.maxSpeciesReturn = this.maxSpeciesReturn - 10;

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

    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);


    // this.content.scrollToTop(400);
  }


  displayFirebase(searchQuery){

    console.log(searchQuery.length)

    if(searchQuery.length >= 2){

      console.log("### CHECKING OUR FIREBASE ###")

      var lowerQuery = searchQuery.toLowerCase();
      if(lowerQuery){

        // GET CONTENT
        this.coreCollection = this.fireStore.collection('Species').valueChanges().subscribe(
        values => {

          values.forEach(eachObj => {
            //console.log(eachObj);

            let wikipediaName;

            if(wikipediaName){
              wikipediaName = eachObj['wikiName'];
            }else{
              wikipediaName = '';
            }

            if(eachObj['name'] && eachObj['genus'] && eachObj['species'] && wikipediaName){
              if(eachObj['name'].includes(lowerQuery) || eachObj['genus'].includes(lowerQuery)  || eachObj['species'].includes(lowerQuery)  || wikipediaName.includes(lowerQuery)){
                if(!this.saltwater){
                  if(eachObj['fresh'] == -1){
                    this.ourFish.push(eachObj);
                    console.log('push freshwater')
                  }
                }else{
                  if(eachObj['fresh'] == 0){
                    this.ourFish.push(eachObj);
                    console.log('push saltwater');
                  }
                }

              }
            }else{
              console.log('Something is missing...')
            }


          });

          //console.log(this.ourFish);

          if(this.ourFish.length){
            // this.populateFirebaseImages(searchQuery);

            this.loadedLocalSpecies = true;

            this.runFishbaseChecker(searchQuery);
          }else{
            console.log('Firebase didn\'t find this species...')
            this.runFishbaseChecker(searchQuery);
          }

          //   // REODER BASED ON SPECIES
          // this.ourFish.sort(function(a, b){
          //   if(a.species < b.species) { return -1; }
          //   if(a.species > b.species) { return 1; }
          //   return 0;
          // });
          //
          // this.checkFavourites(this.ourFish);
        });
      }
    }else{
      console.log('Oop trouble with searchquery')
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

  triggerAutoComplete(query){
    let canRun = true;
    this.allLocalFish = [];

    if(canRun){
      //console.log(query);
      let nameCollection = [];
      let speciesCollection = [];
      let genusCollection = [];
      let distributionCollection = [];
      var habitatCollection = [];
      let descCollection = [];

      if(query.length >= 3){
        this.showPreviousResults = false;

        this.localFishAutoCompleteCollection = this.fireStore.collection('Species').valueChanges().subscribe(
        values => {
          let keyword = query.toLowerCase();

          values.filter((object) => {
            let nameVal;
            let speciesVal;
            let genusVal;
            let destVal;
            let habitVal;
            let descVal;

            if(object['name']){
              nameVal = object['name'].toLowerCase();

              if(nameVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    nameCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    nameCollection.push(object);
                  }
                }
              }
            }

            if(object['wikiName']){
              nameVal = object['wikiName'].toLowerCase();

              if(nameVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    nameCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    nameCollection.push(object);
                  }
                }
              }
            }

            if(object['scotsOtherName']){
              nameVal = object['scotsOtherName'].toLowerCase();

              if(nameVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    nameCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    nameCollection.push(object);
                  }
                }
              }
            }

            if(object['altNames']){
              for(let i in object['altNames']){
                nameVal = object['altNames'][i].name.toLowerCase();

                if(nameVal.includes(keyword)){
                  if(!this.saltwater){
                    if(object['fresh'] == -1){
                      nameCollection.push(object);
                    }
                  }else{
                    if(object['fresh'] == 0){
                      nameCollection.push(object);
                    }
                  }
                }
              }
            }

            if(object['commonName']){
              nameVal = object['commonName'].toLowerCase();

              if(nameVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    nameCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    nameCollection.push(object);
                  }
                }
              }
            }

            if(object['species']){
              speciesVal = object['species'].toLowerCase();

              if(speciesVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    speciesCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    speciesCollection.push(object);
                  }
                }
              }
            }


            if(object['genus']){
              genusVal = object['genus'].toLowerCase();

              if(genusVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    genusCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    genusCollection.push(object);
                  }
                }
              }
            }


            if(object['distribution']){
              destVal = object['distribution'].toLowerCase();

              if(destVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    distributionCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    distributionCollection.push(object);
                  }
                }
              }
            }


            if(object['habitat']){
              habitVal = object['habitat'].toLowerCase();

              if(habitVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    habitatCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    habitatCollection.push(object);
                  }
                }
              }
            }

            if(object['wikiDesc']){
              descVal = object['wikiDesc'].toLowerCase();

              if(descVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    descCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    descCollection.push(object);
                  }
                }
              }
            }

            if(object['scotsSummary']){
              descVal = object['scotsSummary'].toLowerCase();

              if(descVal.includes(keyword)){
                if(!this.saltwater){
                  if(object['fresh'] == -1){
                    descCollection.push(object);
                  }
                }else{
                  if(object['fresh'] == 0){
                    descCollection.push(object);
                  }
                }
              }
            }

          });
        });
      }else{
        this.showAutoComplete = false;
        this.showPreviousResults = false;

        this.allLocalFish = '';
      }

      setTimeout(()=>{
        canRun = false;

        //MASTER CONTROLLER

        if(nameCollection.length >= 1){
          this.allLocalFish.push(nameCollection);
        }

        if(speciesCollection.length >= 1){
          this.allLocalFish.push(speciesCollection);
        }

        if(genusCollection.length >= 1){
          this.allLocalFish.push(genusCollection);
        }

        if(distributionCollection.length >= 1){
          this.allLocalFish.push(distributionCollection);
        }

        if(habitatCollection.length >= 1){
          this.allLocalFish.push(habitatCollection);
        }

        if(descCollection.length >= 1){
          this.allLocalFish.push(descCollection);
        }

        if(this.allLocalFish.length >= 1){
          var merged = [].concat.apply([], this.allLocalFish);
          var clearOfDups = this.removeDuplicatesBy(x => x.specCode, merged);
          this.allLocalFish = clearOfDups;

          console.log(this.allLocalFish);

          this.localFishAutoCompleteCollection.unsubscribe();
          this.showAutoComplete = true;
          this.showPreviousResults = false;
        }else{
          console.log('Nothing found... ' + this.searchQuery)

          if(query.length <= 3){
            console.log('Showing previous Results')
            this.showPreviousResults = true;
          }else{
            this.showPreviousResults = false;
          }

        }

        if(this.allLocalFish.length >= 1){

          this.allLocalFish = this.allLocalFish;

          if(this.localFishAutoCompleteCollection){
            this.localFishAutoCompleteCollection.unsubscribe();
            console.log('Throttle Subscriber!')
          }

        }

      }, 200);


    }else{
      console.log('Cant run');
    }



  }

  clearMoreResults(){
    console.log("BLUR");
    this.showAutoComplete = false;
    this.showPreviousResults = false;
    this.showInstructions = false;
  }

  retriggerAutoComplete(){
    console.log("FOCUS")

    if(this.searchQuery.length <= 3){
      console.log("SHOW HISTORY");

      this.generatePreviousResults();
      this.showAutoComplete = false;
    }else{
      console.log("SHOW AUTOCOMPLETE");
    }

  }

  generatePreviousResults(){

    if(this.afAuth.auth.currentUser){
      this.previousReultsCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/history').valueChanges().subscribe(
      values => {

        if(values.length == 0 || !values){
          console.log('User has no history')
        }else{

          let correctWaterType = [];

          values.forEach(object => {
            if(!this.saltwater){
              if(object['fresh'] == -1){
                correctWaterType.push(object);
              }
            }else{
              if(object['fresh'] == 0){
                correctWaterType.push(object);
              }
            }
          });

          this.showPreviousResults = true;
          var orderedValues = correctWaterType.sort((a, b) => b['dateSet']['seconds'] - a['dateSet']['seconds']);
          this.previousResults = orderedValues;

        }

      });
    }

  }

  getTime(date?: Date) {
    console.log(date['seconds'])
    console.log(new Date(date))
    return date != null ? new Date(date).getTime() : 0;
  }

  addToHistory(fish){
    console.log('ADD SPECIES TO HISTORY LIST PLEASE');

    if(this.afAuth.auth.currentUser){
      this.historyCheckerCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/history').valueChanges().subscribe(
      values => {
        console.log(values);

        if(!values || values.length < 5){

          this.processHistory(fish);

        }else if (values.length == 5){
          console.log('History is 5, delete '+values[4]['specCode']+' item in history')

          let fifthHistorySpecies = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/history/' + values[4]['specCode']);
          fifthHistorySpecies.delete();

          this.processHistory(fish);
        }else{
          console.log('oops, History is great than 5! Clear it!!');

          let historySpecies = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/history');

          for(var i in historySpecies){
            let specificHistorySpecies = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/history/' + historySpecies[i].specCode);
            specificHistorySpecies.delete();
          }

        }

      });
    }

  }

  processHistory(fish){
    console.log('PROCESS HISTORY');
    console.log(fish);

    let speciesName;
    let specCode;
    let fishFresh;

    if(fish.name){
      speciesName = fish.name
    }else if(fish.FBname){
      speciesName = fish.FBname
    }else{
      speciesName = fish.Genus + fish.Species
    }

    if(fish.specCode){
      specCode = fish.specCode
    }else{
      specCode = fish.SpecCode
    }

    if(fish.fresh){
      fishFresh = fish.fresh
    }else{
      fishFresh = fish.Fresh
    }

    let userHistoryAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/history/' + fish.specCode);
    userHistoryAddress.set({
      name: speciesName,
      dateSet: new Date(),
      specCode: specCode,
      fresh: fishFresh
    });

    this.historyCheckerCollection.unsubscribe();
  }

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
          if(eachObj['Fresh'] == 0){
            speciesArray.push(eachObj);
            speciesArray[arrayLength]['id'] = '';
          }
        }
      }else{
        // CHECK THAT SPECIES ISNT ALREADY LISTED
        this.ourFish.forEach(ourFish => {
          if(ourFish['specCode'] == eachObj['SpecCode']){}else{

            if(!this.saltwater){
              if(eachObj['Fresh'] == -1){
                speciesArray.push(eachObj);
                speciesArray[arrayLength]['id'] = '';
              }
            }else{
              if(eachObj['Fresh'] == 0){
                speciesArray.push(eachObj);
                speciesArray[arrayLength]['id'] = '';
              }
            }

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
          console.log('Common Name Results without duplicates:');
          console.log(clearOfDups);


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
              if(ourFish['specCode'] != subSpecies['SpecCode']){
                console.log(1)
                scope.getFullFishResult(subSpecies, key, true);
              }
            });
          }else{
            console.log(scope.relatedSpecies)
            //scope.getFullFishResult(subSpecies, key, true);
          }

        }

      });
    }else{
      //console.log("No main species to check related species against.")

      let specColl = [];

      if(this.ourFish.length >= 1){
        console.log(3)
        scope.getFullFishResult(subSpecies, key, true);
      }else{
        //console.log("No local species to check related species against.")

        console.log(4)
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
    console.log(key);

    var theSpecCode = species['SpecCode']
    this.http.get('https://fishbase.ropensci.org/species?SpecCode=' + theSpecCode + '&limit=1').subscribe(
      result => {
        var pushResults = result['data'][0];
        var newFresh;
        if(!pushResults['Fresh']){
          console.log('Missing Fresh')
          newFresh == -1;
        }else{
          newFresh = pushResults['Fresh'];
        }

        if(!this.saltwater){
          if(newFresh == -1 && newFresh !== 'rasbora'){
            this.relatedSpecies.push(pushResults);
            if(this.relatedSpecies[key])
            this.relatedSpecies[key]['id'] = '';
          }
        }else{
          if(newFresh != -1){
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



  addTankTrigger(fish){
    this.showSelectTank = true;
    console.log('Showing tank select...')

    this.toAddToTankSpecies = fish;

    this.addTankCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
    values =>{
      this.tanks = values;
      this.tanks.sort((a, b) => (a.order > b.order) ? 1 : -1)
    });
  }


  areYouSureTheseArentInTheDatabase(){
    console.log("### REPOPULATING LOCAL SPECIES ###");

    setTimeout(()=>{
        this.recheckerCollection = this.fireStore.collection('Species').valueChanges().subscribe(values => {
          values.forEach(localSpecies => {
            //this.ourFish.forEach(ourFishSpecies => {

              this.fbSpecies.forEach((species, key) => {
                if(localSpecies['specCode'] == species['SpecCode']){


                  if(!this.saltwater){
                    if(localSpecies['fresh'] == -1){
                      this.ourFish.push(localSpecies);

                      this.fbSpecies.splice(key, 1);
                    }
                  }else{
                    if(localSpecies['fresh'] == 0){
                      this.ourFish.push(localSpecies);

                      this.fbSpecies.splice(key, 1);
                    }
                  }
                }


                this.fbSpecies[key]['id'] = key;

              });

              if(this.relatedSpecies.length < 1){
                this.relatedSpecies.forEach((species, key) => {

                  if(localSpecies['specCode'] == species['SpecCode']){


                    if(!this.saltwater){
                      if(localSpecies['fresh'] == -1){
                        this.ourFish.push(localSpecies);

                        this.fbSpecies.splice(key, 1);
                      }
                    }else{
                      if(localSpecies['fresh'] == 0){
                        this.ourFish.push(localSpecies);

                        this.fbSpecies.splice(key, 1);
                      }
                    }


                    this.fbSpecies[key]['id'] = key;

                  }
                });
              }


          });
        });

    });

    setTimeout(()=>{
      console.log('###  FB SPECIES WITHOUT LOCAL FISH ###')
      console.log(this.fbSpecies)

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

    clearOurFishOfDups.forEach(function(value, key) {
      //console.log(key, value)
      clearOurFishOfDups[key]['id'] = key;
    });

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
                let firstWord =  searchQuery.split(" ")[0];
                this.http.get('https://fishbase.ropensci.org/species?Genus=' + firstWord + '&limit=500').subscribe(
                  result => {
                    // Found potential genus based from first word in string
                    this.displayFishbase(result, firstWord);
                    console.log('Genus found! However species removed')
                  },
                  error => {
                    let lastWord = searchQuery.split(" ").splice(-1);
                    this.http.get('https://fishbase.ropensci.org/species?Species=' + lastWord + '&limit=500').subscribe(
                      result => {
                        // Found potential species based from last word in string
                        this.displayFishbase(result, searchQuery);
                        console.log('Species found! However genus removed')
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
        });

  }



  // ADD SPECIES TO FIREBASE DATABASE
  addToDatabase(fish){
    console.log("### ADDING SPECIES TO DATABASE ###")
    console.log(fish);

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
      fishBaseImg: fishImgName,
      genus: fishGenus,
      comments: proccessedComments,
      dangerous: fish.Dangerous,
      length: fish.Length,
      genCode: fish.GenCode,
      specCode: fish.SpecCode,
      SpeciesRefNo: fish.SpeciesRefNo,
      vulnerability: fish.Vulnerability,
      viewCount: 0,
      addedDate: new Date(),
      versionCode: this.runningVersion,
      fresh: fish.Fresh
    });

    var specCode = fish['SpecCode']

    //console.log('BASIC FISH INFO SAVED TO DB')
    this.presentNewSpeciesLoading(fish);

    this.getMoreGoogleImages(fish, specCode);

    var populateImgesInt = setInterval(()=>{
      if(this.googleImageArray.length != 0){
        clearInterval(populateImgesInt);
        console.log('### SAVING IMAGES ###')

        // SAVE PHOTOS TO DATABASE
        var speciesAddress = this.fireStore.doc<any>('Species/' + fish.SpecCode);

        speciesAddress.update({
          Pics:this.googleImageArray
        });

        this.unsubscriber();

        this.theInternetIsMyBitchAndShesBeenABadGirl(fish);

      }else{
        console.log('trying to populate species... ' + this.googleImageArray.length)
      }
    }, 500);
  }

  plantSearch(searchquery){

  }

  // GENERATE IMAGES FROM GOOGLE FOR CARDS
  getGoogleImages(obj){
    var imageArr = [];
    var amountOfImagesToGather = 2;

    if (this.isInApp) {
      //console.log('### GENERATING GENERAL IMAGES ON IOS / ANDROID ###');

      setTimeout(()=>{
        this.nativeHttp.get('https://www.googleapis.com/customsearch/v1?q='+ obj['Genus'] + "%20" + obj['Species'] +'&searchType=image&num=' + amountOfImagesToGather +'&key=AIzaSyAPvDEdOoGeldbbmVWShXguFmWFaX79DI8&cx=013483737079049266941:mzydshy4xwi', {}, {})
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

          }).catch(error => {
            console.log(error)
          });
      });
    }else {
      //console.log('### GENERATING GENERAL IMAGES ON BROWSER ###');

      setTimeout(()=>{
        this.http.get('https://www.googleapis.com/customsearch/v1?q='+ obj['Genus'] + "%20" + obj['Species'] +'&searchType=image&num='+ amountOfImagesToGather +'&key=AIzaSyAPvDEdOoGeldbbmVWShXguFmWFaX79DI8&cx=013483737079049266941:mzydshy4xwi').subscribe(
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

    if (this.isInApp) {
      console.log('### GENERATING ' + this.amountOfImageToGenerate + ' GOOGLE IMAGES ON IOS/ANROID ###');
      setTimeout(()=>{
        this.nativeHttp.get('https://www.googleapis.com/customsearch/v1?q='+ fish['Genus'] + "%20" + fish['Species'] + '&searchType=image&num='+ this.amountOfImageToGenerate +'&key=AIzaSyAPvDEdOoGeldbbmVWShXguFmWFaX79DI8&cx=013483737079049266941:mzydshy4xwi', {}, {})
          .then(data => {

            var mainData = JSON.parse(data.data);
            //console.log(data.data);

            var loopValue = mainData['items'];

            loopValue.forEach(obj => {
              //console.log(obj);
              this.googleImageArray.push(obj['link']);
            });

          }, error => {
            console.log(JSON.stringify(error));
          });
        });
    }else{
      console.log('### GENERATING ' + this.amountOfImageToGenerate + ' GOOGLE IMAGES ON BROWSER ###');
      setTimeout(()=>{

        this.http.get('https://www.googleapis.com/customsearch/v1?q='+ fish['Genus'] + "%20" + fish['Species'] + '&searchType=image&num='+ this.amountOfImageToGenerate +'&key=AIzaSyAPvDEdOoGeldbbmVWShXguFmWFaX79DI8&cx=013483737079049266941:mzydshy4xwi').subscribe(
          result => {
            console.log(result);

            this.fullImageCollection.push(result['items']);
          }, error => {
            console.log(error);
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

    this.minSpeciesReturn = 0;
    this.maxSpeciesReturn = 10;
    this.minSpeciesReturn = 0;
    this.maxSpeciesReturn = 10;
    this.minSpeciesReturn = 0;
    this.maxSpeciesReturn = 10;

    this.showPondSpecies = true;
    this.showFishbaseRelatedSpecies = true;
    this.showFishbaseSpecies = true;

    this.genusDescription = [];

    this.currentFamily = '';
    this.relatedGenus = [];
    this.bettaVariations = [];

    //console.log('fishbase species: ', this.fbSpecies )
    //console.log('temp fishbase species: ',this.tempFBSpecies)

    if(this.fbSpecies.length >= 1 && this.tempFBSpecies.length < 1){
      console.log('Populating fbspecies temp species...')
      this.tempFBSpecies = this.fbSpecies;
    }else{
      this.fbSpecies = this.tempFBSpecies;
    }

    if(this.ourFish.length >= 1 && this.tempOURSpecies.length < 1){
      console.log('Populating our temp species...');
      this.tempOURSpecies = this.ourFish;
    }else{
      this.ourFish = this.tempOURSpecies;
    }

    if(this.relatedSpecies.length >= 1 && this.tempRELATEDSpecies.length < 1){
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

    if(this.ourFish.length != 0){
      var clearOurFishDups = this.removeDuplicatesBy(x => x.SpecCode, this.ourFish);
      this.ourFish = clearOurFishDups;
    }

    this.resetAndOrganiseSpecies();

    this.doneLoading = true;

    this.router.navigate(
    [],
    {
      relativeTo: this.route,
      queryParams: { letter: letter },
      queryParamsHandling: 'merge'
    });

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

    this.relatedSpecies = fishbaseSpecies;
  }

  clearSwitcher(){
    console.log("STARTING SWITCH CLEAR...");
    this.presentLoading();
    this.generateGenusDescription();

    setTimeout(()=>{
      console.log("CLEARING SWITCH");

      this.selectedLetter = '';

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

      this.resetAndOrganiseSpecies();

      console.log('fix navigation');
      this.router.navigate([],{
        relativeTo: this.route,
        queryParams: { letter: null },
        queryParamsHandling: 'merge'
      });

      this.dismissLoading();
    }, 300);




  }

  resetAndOrganiseSpecies(){

    let tempOurFish = [];
    let tempFBSpecies = [];
    let tempRELATEDSpecies = [];

    this.ourFish.forEach(function(value) {
      if(value){
        tempOurFish.push(value)
      }
    });

    this.fbSpecies.forEach(function(value) {
      if(value){
        tempFBSpecies.push(value)
      }
    });


    this.relatedSpecies.forEach(function(value) {
      if(value){
        tempRELATEDSpecies.push(value)
      }
    });


    var clearTempOurFish = this.removeDuplicatesBy(x => x.specCode, tempOurFish);
    this.ourFish  = clearTempOurFish;
    var clearTempFBSpecies = this.removeDuplicatesBy(x => x.SpecCode, tempFBSpecies);
    this.fbSpecies  = clearTempFBSpecies;
    var clearTempRelatedSpecies = this.removeDuplicatesBy(x => x.SpecCode, tempRELATEDSpecies);
    this.relatedSpecies  = clearTempRelatedSpecies;


    console.log(this.ourFish.length + ' local species, ' + this.fbSpecies.length + ' fishbase species, ' + this.relatedSpecies.length + ' related fishbase species.')

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
        species: this.randomSpecies['species'],
        order: 0,
      },{
        merge: true
      });

      console.log(this.randomSpecies)
    }

  }

  // swipeEvent(e) {
  //     if (e.direction == 2) {
  //       if(this.speciesSelected){
  //         this.unSelectSpecies();
  //       }
  //     }
  // }


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

    this.variationsCollection = this.fireStore.collection('Species/' + specCode + "/Variations").valueChanges().subscribe(values => {
      this.variations = values;
    });

  }


  theInternetIsMyBitchAndShesBeenABadGirl(species){
    console.log('### RUNNING SERIOUSLY FISH WEB SCRAPER ###');
    this.sfSpecies = species;

    // Check double species url type
    if(this.sfSpecies['species']){
      var searchParam = this.sfSpecies['genus'] + '-' + this.sfSpecies['species'] + '-' + this.sfSpecies['species'];
    }else if(species['Species']){
      var searchParam = this.sfSpecies['Genus'] + '-' + this.sfSpecies['Species'] + '-' + this.sfSpecies['Species'];
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.seriouslyfish.com/species/'+searchParam+'/&xpath=p');
    if(this.debug){
      console.log('running on ' + scraperURL)
    }

    this.http.get(corsFix + scraperURL).subscribe(result => {
        console.log(result);

        var res = [];
        for (var x in result){
           result.hasOwnProperty(x) && res.push(result[x])
        }

        var speciesIsInDouble = true;

        res.forEach(function(value) {
          if(value['text'].includes('Sorry, we couldn\'t find the page you were looking for.')){
            speciesIsInDouble = false;
          }
        });

        if(speciesIsInDouble){
          console.log('url had double dash')
          this.addSeriousFish(result);
        }else{
          console.log('url was singlular')
          this.runSingleSeriosulyFishUrlType()
        }
    }, error => {
      console.log(error);

      this.ScotMateILoveIt(this.sfSpecies);
    });

  }

  runSingleSeriosulyFishUrlType(){
    // Check single species url type
    if(this.sfSpecies['species']){
      var searchParam = this.sfSpecies['genus'] + '-' + this.sfSpecies['species'];
    }else if(this.sfSpecies['Species']){
      var searchParam = this.sfSpecies['Genus'] + '-' + this.sfSpecies['Species'];
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.seriouslyfish.com/species/'+searchParam+'/&xpath=p');
    if(this.debug){
      console.log('running on ' + scraperURL)
    }

    this.http.get(corsFix + scraperURL).subscribe( result => {
        this.addSeriousFish(result);
    }, error => {
      console.log(error);
      console.log('Oh no! A seriosuly fish issue...')

      this.theInternetIsMyBitchAndShesBeenABadGirl(this.species);
    });

  }

  addSeriousFish(result){
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

      let sfTxt = value['text'].toLowerCase();

      if(sfTxt.includes('sorry, we couldn\'t find the page you were looking for.')){
        console.log('SERIOUSLY FISH CANNOT FIND THIS SPECIES');
      }else{
        //console.log('FISH FOUND');

        if(sfTxt.includes('from the ancient') || sfTxt.includes('from the latin') || sfTxt.includes('originally named') || sfTxt.includes('named for')){
          // console.log('--- Etymology ---');
          var ety = value['text']
          detailedFishInformation['SFEtymology'] = ety;
        }

        if(sfTxt.includes('temperature:')){
          // console.log('--- Temperature of species: ---');
          var temp = value['text'].replace('Temperature:','').replace('C','');
          detailedFishInformation['temperature'] = temp;
        }

        if(sfTxt.includes('ph:')){
          // console.log('--- PH of species: ---');
          var ph = value['text'].replace('pH:','');
          detailedFishInformation['ph'] = ph;
        }

        if(sfTxt.includes('family:')){
          // console.log('--- Family of species: ---');
          var fam = value['text'].replace('Order:','').replace('Family:','').split(" ");
          console.log(fam)
          var finalFam = fam[fam.length - 1];

          console.log(finalFam);

          detailedFishInformation['family'] = finalFam;
        }

        if(sfTxt.includes('order:')){
          // console.log('--- Order of species: ---');
          var order = value['text'].replace('Order:','').replace('Family:','').split(" ");
          console.log(order);
          var finalOrder = order[1];

          console.log(finalOrder);

          detailedFishInformation['order'] = finalOrder;
        }

        if(sfTxt.includes('hardness:')){
          // console.log('--- Hardness of species: ---');
          var hard = value['text'].replace('Hardness:','').replace('ppm','');
          detailedFishInformation['hardness'] = hard;
        }

        if(sfTxt.includes('size:') || sfTxt.includes('body length') || sfTxt.includes('mm.') || sfTxt.includes('males to') ){
          // console.log('--- Size of species: ---');
          //

          if(detailedFishInformation['size']){
            detailedFishInformation['size'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['size'] = value['text'];
          }

        }

        if(sfTxt.includes('base dimensions') || sfTxt.includes('an aquarium measuring') || sfTxt.includes('an aquarium with') || sfTxt.includes('can be kept in a tank')){
          // console.log('--- Recommended Tank Size of species: ---');

          if(detailedFishInformation['tankSize']){
            detailedFishInformation['tankSize'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['tankSize'] = value['text'];
          }
        }

        if(sfTxt.includes('nigeria') || sfTxt.includes('guinea') || sfTxt.includes('brazil') || sfTxt.includes('river system') || sfTxt.includes('venezuela') || sfTxt.includes('specimens collected') || sfTxt.includes('wild fish') || sfTxt.includes('africa') || sfTxt.includes('thailand') || sfTxt.includes('locality')){
          // console.log('--- Recommended Tank Size of species: ---');
          if(detailedFishInformation['locality']){
            detailedFishInformation['locality'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['locality'] = value['text'];
          }
        }

        if(sfTxt.includes('best kept with') || sfTxt.includes('group of') || sfTxt.includes('general community') || sfTxt.includes('aggressive towards') || sfTxt.includes('ideally stock') || sfTxt.includes('very peaceful') || sfTxt.includes('preferably more') || sfTxt.includes('ideal tankmates') || sfTxt.includes('kept in groups or pairs')){
          // console.log('--- Behaviour/Compatibility of species: ---');
          if(detailedFishInformation['tankMates']){
            detailedFishInformation['tankMates'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['tankMates'] = value['text'];
          }
        }

        if(sfTxt.includes('has been bred in aquaria') || sfTxt.includes('spawning') || sfTxt.includes('spawn') ||  sfTxt.includes('eggs') ||  sfTxt.includes('the fry')  ||  sfTxt.includes('drying') || sfTxt.includes('breed') || sfTxt.includes('for the first few days') || sfTxt.includes('nester') ){
          // console.log('--- Reproduction of species: ---');
          if(detailedFishInformation['repoduction']){
            detailedFishInformation['repoduction'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['repoduction'] = value['text'];
          }
        }

        if(sfTxt.includes('other decor can include') || sfTxt.includes('well planted with') || sfTxt.includes('use a substrate') || sfTxt.includes('some cover') || sfTxt.includes('over the aquarium') || sfTxt.includes('lighting') || sfTxt.includes('provide areas of') || sfTxt.includes('leaf litter') || sfTxt.includes('driftwood') || sfTxt.includes('well-planted') ){
          // console.log('--- Recommended Tank Size of species: ---');
          if(detailedFishInformation['enviroment']){
            detailedFishInformation['enviroment'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['enviroment'] = value['text'];
          }
        }

        if(sfTxt.includes('also known as') || sfTxt.includes('bloodlines') || sfTxt.includes('closely-related species')){
          // console.log('--- Recommended Tank Size of species: ---');
          if(detailedFishInformation['SFComments']){
            detailedFishInformation['SFComments'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['SFComments'] = value['text'];
          }
        }

        // if(value['text'].includes('substrate')){
        //   // console.log('--- Recommended Substrate of species: ---');
        //   detailedFishInformation['substrate'] = value['text'];
        // }

        if(sfTxt.includes('sexually') || sfTxt.includes('quite difficult to sex') || sfTxt.includes('males are') || sfTxt.includes('females are')){
          // console.log('--- Sexual Identification of species: ---');
          if(detailedFishInformation['sexIdentification']){
            detailedFishInformation['sexIdentification'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['sexIdentification'] = value['text'];
          }
        }

        if(sfTxt.includes('inhabits') || sfTxt.includes('exclusively found') || sfTxt.includes('rainforest') || sfTxt.includes('habitat') || sfTxt.includes('habitats') || sfTxt.includes('fish are also found') || sfTxt.includes('natural range') || sfTxt.includes('wild populations')){
          // console.log('--- Habitat of species: ---');
          if(detailedFishInformation['habitat']){
            detailedFishInformation['habitat'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['habitat'] = value['text'];
          }
        }

        if(sfTxt.includes('omnivorous') || sfTxt.includes('omnivores') || sfTxt.includes('dried foods') || sfTxt.includes('micropredator') || sfTxt.includes('bloodworm') ||  sfTxt.includes('prey on') ||  sfTxt.includes('obesity') ){
          // console.log('--- Diet of species: ---');
          if(detailedFishInformation['diet']){
            detailedFishInformation['diet'] += '<br /><br />' + value['text'];
          }else{
            detailedFishInformation['diet'] = value['text'];
          }
        }

        if(sfTxt.includes('stained brownish')){
          // console.log('--- Blackwater: ---');
          detailedFishInformation['blackWater'] = true;
        }

        if(sfTxt.includes('aquatic plants may also be present') || sfTxt.includes('well planted') || sfTxt.includes('<b>aquatic</b> plants')){
          // console.log('--- Aquatic plants: ---');
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
      this.populateDetailedInformation(this.sfSpecies);
    }

    this.ScotMateILoveIt(this.sfSpecies);

  }

  populateDetailedInformation(species){

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }


    if(this.detailedFishInformation['SFEtymology']){
      speciesAddress.set({
        SFEtymology:this.detailedFishInformation['SFEtymology']
      },{
        merge: true
      });
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

    if(this.detailedFishInformation['family']){
      speciesAddress.set({
        family:this.detailedFishInformation['family']
      },{
        merge: true
      });
    }


    if(this.detailedFishInformation['order']){
      speciesAddress.set({
        order:this.detailedFishInformation['order']
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
      var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=' + error.error['text'] +'/&xpath=tr');

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
        var processedName = eachTxt['text'].replace('Common Names','').replace('Common Name','').trim();
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

      if(eachTxt['html'].includes('Breeding</a>')){
        var processedBreed = eachTxt['text'].replace('Breeding','').trim();
        // console.log('Sexing: ' + processedSex)
        planetCatfishInformation['breeding'] = processedBreed;
      }

      if(eachTxt['text'].includes('Distribution') && !eachTxt['text'].includes('of selected')){
        var processedDis = eachTxt['text'].replace('Distribution','').replace(/\(click on these areas to find other species found there\)/g, '').replace('Log in to view species occurence data on a map.', '').replace('Log in to view data on a map.', '').replace('.', '. ').trim();
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

    if(this.planetCatfishInformation['temp']){
      speciesAddress.set({
       catTemperature:this.planetCatfishInformation['temp']
      },{
        merge: true
      });
    }

    if(this.planetCatfishInformation['ph']){
      speciesAddress.set({
        catPh:this.planetCatfishInformation['ph']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['locality']){
      speciesAddress.set({
        catLocality:this.planetCatfishInformation['locality']
      },{
        merge: true
      });
    }
    if(this.planetCatfishInformation['commonName']){
      speciesAddress.set({
        commonName:this.planetCatfishInformation['commonName']
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
    if(this.planetCatfishInformation['breeding']){
      speciesAddress.set({
        breeding:this.planetCatfishInformation['breeding']
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

        let genus;

        if(species['Genus']){
          genus = species['Genus'].toLowerCase();
        }else{
          genus = species['genus'].toLowerCase();
        }

        if(taxon.includes(genus)){
          taxon.replace('Spp.', 'All species of' + genus)

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

    console.log("### GETTING NORWEGIAN SEA WATER RESULTS ###")

    let speciesAddress;
    let searchQuery;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
      searchQuery = species['species'].toLowerCase();
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
      searchQuery = species['Species'].toLowerCase();
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var userURL = 'http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://www.seawater.no/fauna/chordata/'+ searchQuery +'.html&xpath=//div[@id=article]/p[1]#vws';
    var userURL1 = 'http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://www.seawater.no/fauna/chordata/'+ searchQuery +'.html&xpath=//div[@id=article]/p[2]#vws';
    var userURL2 = 'http://motyar.info/webscrapemaster/api/?key=williamfische20&url=?url=http://www.seawater.no/fauna/chordata/'+ searchQuery +'.html&xpath=//div[@id=article]/p[3]#vws';
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
    var userURL = 'http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://shark-references.com/species/view/'+ searchQuery +'&xpath=//div[@id=content]/div/div#vws';
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
              sharkDesc: eachRes['text'].replace('Short Description', '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Distribution')){
            speciesAddress.set({
              sharkDist: eachRes['text'].replace('Distribution', '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Biology')){
            speciesAddress.set({
              sharkBio: eachRes['text'].replace('Biology', '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Size / Weight / Age')){
            speciesAddress.set({
              sharkSize: eachRes['text'].replace('Size / Weight / Age', '').trim()
            },{
              merge: true
            });
          }

          if(eachRes['text'].includes('Habitat')){
            speciesAddress.set({
              sharkHabitat: eachRes['text'].replace('Habitat', '').trim()
            },{
              merge: true
            });
          }

        });

        if(this.saltwater){
          this.howAboutReefLifeSurvey(species)
        }else{
          this.newSpeciesDonePopulating(species);
        }

      }else{
        if(this.saltwater){
          this.howAboutReefLifeSurvey(species)
        }else{
          this.newSpeciesDonePopulating(species);
        }
      }



    }, error => {
      //console.log(error);
      if(this.saltwater){
        this.howAboutReefLifeSurvey(species)
      }else{
        this.newSpeciesDonePopulating(species);
      }
    });


  }

  newSpeciesDonePopulating(fish){
    console.log("DONE - WRAPPING UP & SHOWING NEW SPECIES...");

    this.unsubscriber();

    setTimeout(()=>{
      this.speciesLoaded = true;
      this.speciesDataLoaded = true;

      if(this.updatingSpecies){
        this.dismissLoading();
      }else{
        this.dismissNewSpeciesLoading();
      }

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

                  this.relatedSearchResults = null;
                }else{
                  this.relatedSearchResults = extract;
                  this.everythingsTruelyDone();


                  setTimeout(()=>{
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
                            this.checkPageForRelatedResult(result3);
                          }, 500);
                        });
                    }
                  }, 1000);

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

    if(foundSp[0]){
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
    }else{
      console.log('can\'t find hidden results')
    }


  }

  everythingsTruelyDone(){
    console.log('everythings done...');

    this.content.scrollToTop(400);
    this.doneLoading = true;

    if(this.fbSpecies.length == 1 && !this.fbSpecies[0].SpecCode){
      this.fbSpecies = [];
    }else{
      var slicedSpecies = this.fbSpecies.slice(this.minSpeciesLocalReturn, (+this.maxSpeciesLocalReturn + 1));

      slicedSpecies.forEach(obj => {
        if(obj['id'] >= this.minSpeciesLocalReturn && obj['id'] <= (+this.maxSpeciesLocalReturn + 1)){

          if(!obj['Pics'] || obj['Pics'].length == 0){
            this.getGoogleImages(obj)
            console.log('populting obj with img')
          }

        }
      });
    }

    if(this.relatedSpecies.length == 1 && !this.relatedSpecies[0].SpecCode){
      this.relatedSpecies = [];
    }

    if(this.urlLetter){
      this.newLetterSwitcher(this.urlLetter)
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search_query: this.searchQuery.toLowerCase() },
      queryParamsHandling: 'merge'
    });

    this.dismissNewSpeciesLoading();

    setTimeout(()=>{
      this.unsubscriber();

      this.resetAndOrganiseSpecies();
    }, 1000);

  }

  localSpeciesDonePopulating(fish){
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
      message: genus + ' ' + species + ' is new to Pond! Adding to system, this may take a while...'
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
    if(this.isLoadingNewSpecies){
      this.isLoadingNewSpecies = false;
      return await this.loadingController.dismiss();
    }
  }

  async presentLoading() {
    return await this.loadingController.create({
      message: 'Loading...'
    }).then(a => {
      a.present().then(() => {
        //console.log('loading presented');
      });
    });
  }

  async presentUpdating() {
    this.isLoadingNewSpecies = true;

    return await this.loadingController.create({
      message: 'Updating...'
    }).then(a => {
      a.present().then(() => {
        //console.log('loading presented');
      });
    });
  }

  async dismissLoading() {
    if(this.loadingController){
      return await this.loadingController.dismiss();
    }
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
    this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&indexpageids&redirects=1&titles=' + searchName).subscribe(
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

          if(result){
            for (var i in wikiLink) {
              var extract = wikiLink[i].extract;

              if(!extract || extract == '<p class="mw-empty-elt">'){
                console.log('Genus couldn\'t be located on Wikipedia')
              }else{
                if(extract.length >= 100){
                  this.genusDescription = extract + ' <u>(click for more)</u>';
                }
              }
            }
          }else{
            console.log('Can\'t find genus decription');
          }

          this.findFamily();
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

          if(this.debug){
            console.log(result)
          }

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

  findFamily(){
    var testStr = this.genusDescription;
    var family = testStr.substring(testStr.indexOf('family') + 7);

    var actualFam = family.split('.', 1)[0].replace('(', '').replace(')', '').replace('<b>', '').replace('</b>', '');

    this.checkFamilyOnWiki(actualFam);
  }

  checkFamilyOnWiki(family){
    console.log(family);
    this.currentFamily = family;

    this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=revisions&rvprop=content&rvsection=0&titles=' + family).subscribe(
      result => {
        if(result['query']){
          var wikiLink = result['query'].pages;
          console.log(result)

          for (var i in wikiLink) {
            if(wikiLink[i].revisions){
              var extract = wikiLink[i].revisions[0]['*'];
              console.log(extract);

              var curlysonly = /\{{[^)]*\}}/g;
              var noCurls = extract.match(curlysonly);

              var regExp = /\[(.*?)\]/g;
              var matches = noCurls[0].match(regExp);

              matches.forEach(function(match, i){
                matches[i] = match.replace('[[', '').replace(']]', '').replace(']', '').replace('Chordata', '').replace('Chordate', '').replace('|', ' ');
              });

              matches.splice(0, 2);

              this.relatedGenus = matches;

              if(this.debug){
                console.log(this.relatedGenus)
              }
            }else{
              console.log('No Wikilink revision found.')
            }
        }
        }else{
          console.log('### ERROR GETTING FAMILY INFORMATION ####')
        }
    }, error => {
      console.log('### ERROR GETTING FAMILY INFORMATION ####')
    });
  }

  tryFishesOfAutralia(species){
    let allResults;

    console.log("### GETTING FISHES OF AUSTRALIA RESULTS ###")

    let theGenus;
    let theSpecies;
    let theAuthor;

    if(species['Genus']){

      theGenus = species['Genus'];
      theSpecies = species['Species'];
      theAuthor = species['Author'];

    }else if (species['genus']){

      theGenus = species['genus'];
      theSpecies = species['species'];
      if(species['author']){
        theAuthor = species['author'];
      }else{
        theAuthor = '';
      }

    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var userURL = 'http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://fishesofaustralia.net.au/search?size=50%26q=' + theGenus + '&xpath=//div[@id=content]/div[3]/div/div/ul/a#vws';
    var scraperURL = encodeURIComponent(userURL);
    var currentSpecies = '<i>' + theGenus + ' ' + theSpecies + '</i>';
    var currentAuthor = '<span>' + theAuthor.replace(/,/g, '').replace('&', '&amp;') + '</span>';

    if(this.debug){
      console.log(userURL)
      console.log('ON ADDRESS http://fishesofaustralia.net.au/search?q=' + theGenus)
    }


    this.http.get(corsFix + scraperURL).subscribe(result => {

      if(result){

        if(this.debug){
          console.log(result)
        }

        allResults = result;

        let href;

        allResults.forEach(eachRes => {
          if(eachRes['html'].includes(currentSpecies) || eachRes['html'].includes(currentAuthor) || eachRes['html'].includes(theSpecies)){
            console.log("FISHES OF AUSTRALIA FOUND SPECIES")
            href = eachRes['href']

            this.generateFishesOfAustralia(species, href)
          }
        });


        setTimeout(()=>{
          if(!href){
            this.perhapsReefApp(species);
            console.log("NOTHING FOUND ON FISHES OF AUSTRALIA")
          }
        });
      }else{
        console.log('### SPECIES DOSENT EXIST IN FISHES OF AUSTRALIA ###')
        this.perhapsReefApp(species);
      }

    }, error => {
      console.log(error)
      console.log('### SPECIES DOSENT EXIST IN FISHES OF AUSTRALIA ###')
      this.perhapsReefApp(species);
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
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://fishesofaustralia.net.au' + href + '&xpath=//div[@id=content]/div[3]/div[1]/div/div#vws');

    if(this.debug){
      console.log('ON ADDRESS http://fishesofaustralia.net.au' + href)
      console.log('against ' + href)
    }

    this.http.get(corsFix + scraperURL).subscribe(
    result => {
      if(this.debug){
        console.log(result)
      }

      if(result){

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
        this.perhapsReefApp(species);
      }
    }, error => {
      console.log(error)
      console.log('### SPECIES DOSENT EXIST IN FISHES OF AUSTRALIA ###')
      this.perhapsReefApp(species);
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
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://fishesofaustralia.net.au' + href +'&xpath=//div[@id=content]/div[2]/div/div/div/div/div[2]/table/tbody/tr#vws');

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


        this.perhapsReefApp(species);

      }else{
        console.log('Species dosen\'t have more info')
        this.perhapsReefApp(species);
      }
    })
  }

  perhapsReefApp(species){
    if(species['fresh'] == 0){
      let speciesAddress;

      console.log("### GETTING REEF APP RESULTS ###")

      var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
      var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://reefapp.net/en/lex/details/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=wrap]/div[3]/div[2]/div/div/table/tbody/tr/td#vws');

      if(this.debug){
        console.log('ON ADDRESS https://reefapp.net/en/lex/details/' + species['Genus'] + '-' + species['Species'])
      }

      this.http.get(corsFix + scraperURL).subscribe(result => {
        if(this.debug){
          console.log(result)
        }

        if(species['specCode']){
          speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
        }else{
          speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
        }


        for(var i in result){
          if(result[i].text.includes('Family')){
            if(result[i].text){
              speciesAddress.set({
                reefAppFam: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Origin')){
            if(result[i].text){
              speciesAddress.set({
                reefAppOrigin: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Max length')){
            if(result[i].text){
              speciesAddress.set({
                reefAppSize: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Minimum volume')){
            if(result[i].text){
              speciesAddress.set({
                reefTankSize: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Hardiness')){
            if(result[i].text){
              speciesAddress.set({
                reefHardiness: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Suitable for aquarium')){
            if(result[i].text){
              speciesAddress.set({
                reefAquriumSutible: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Reef safe')){
            if(result[i].text){
              speciesAddress.set({
                reefReefSafe: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Aggressiveness')){
            if(result[i].text){
              speciesAddress.set({
                reefAggressiveness: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Mostly') ||  result[i].text.includes('Maybee')){
            if(result[i].text){
              speciesAddress.set({
                reefMainFood: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Recommended')){
            if(result[i].text){
              speciesAddress.set({
                reefRecommendedFood: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Aquarium trade')){
            if(result[i].text){
              speciesAddress.set({
                reefInAquaria: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('Distribution')){
            if(result[i].text){
              speciesAddress.set({
                reefDistribution: result[+i + +1].text
              },{
                merge: true
              });
            }
          }

          if(result[i].text.includes('English common names')){
            if(result[i].text){
              speciesAddress.set({
                reefCommonName: result[+i + +1].text
              },{
                merge: true
              });
            }
          }
        }

        this.checkAustralianLaws(species);

      }, error => {
        if(this.debug){
          console.log(error)
        }
        console.log("NO REEF APP RESULTS");

        this.checkAustralianLaws(species);
      });
    }else{
      console.log("NO REEF APP REQUIRED - FISH IS FRESHWATER");

      this.checkAustralianLaws(species);
    }

  }

  howAboutReefLifeSurvey(species){
    console.log("### GETTING REEF LIFE SURVEY DESCRIPTION RESULTS ###")

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[2]/div[2]#vws');

    if(this.debug){
      console.log('ON ADDRESS https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'])
    }

    this.http.get(corsFix + scraperURL).subscribe(result => {
        if(this.debug){
          console.log(result)
        }

        if(result){
          let desc = result[0].text;

          if(desc.length > 1){
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
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[3]/div[2]/ul/li[1]#vws');

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
    }, error => {
      console.log(error);
    });
  }

  generateReefSurveyHabitat(species){
    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[3]/div[2]/ul/li[3]#vws');

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
            reefHabitat: habitat.replace('Habitat:', '')
          },{
            merge: true
          });
        }else{
          console.log('NO HABITAT')
        }

        this.generateReefSurveyDepth(species);
    }, error => {
      console.log(error);
    });
  }

  generateReefSurveyDepth(species){
    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.reeflifesurvey.com/species/' + species['Genus'] + '-' + species['Species'] + '&xpath=//div[@id=main-content]/div[2]/div[1]/div[2]/div[3]/div[2]/ul/li[2]#vws');

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
    }, error => {
      console.log(error);
    });
  }

  ScotMateILoveIt(species){
    console.log('### GENERATE SCOTCAT RESULTS ###')

    console.log(species);
    let scotResult;

    if(species['Genus']){
      scotResult = species['Genus'] + '_' + species['Species'];
    }else{
      scotResult = species['genus'] + '_' + species['species'];
    }

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.scotcat.com/factsheets/' + scotResult + '.html&xpath=/html/body/table[3]/tbody/tr[1]/td[1]/div/table/tbody/tr/td/font');
    var scraperURLTWO = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.scotcat.com/factsheets/' + scotResult + '.htm&xpath=/html/body/table[3]/tbody/tr[1]/td[1]/div/table/tbody/tr/td/font');
    var scraperURLTHREE = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.scotcat.com/factsheets/' + scotResult + '.htm&xpath=/html/body/table[3]/tbody/tr[1]/td[2]/table/tbody/tr[2]/td/table/tbody/tr/td/font');
    var scraperURLFOUR = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.scotcat.com/factsheets/' + scotResult + '.html&xpath=/html/body/table[3]/tbody/tr[1]/td[2]/table/tbody/tr[2]/td/table/tbody/tr/td/font');

    if(this.debug){
      console.log('running on ' + scraperURL)
    }

    this.http.get(corsFix + scraperURL).subscribe( result => {

      if(result){
        this.processScotCat(species, result);
      }else{
        this.trySecondScotCat(species, corsFix, scraperURLTWO);
      }

    }, error => {
      this.trySecondScotCat(species, corsFix, scraperURLTWO);
    });

    this.getMoreFromScott(species, corsFix, scraperURLTHREE, scraperURLFOUR);
  }

  trySecondScotCat(species, corsFix, scraperURLTWO){
    if(this.debug){
      console.log('running on ' + scraperURLTWO)
    }

    this.http.get(corsFix + scraperURLTWO).subscribe( result => {
      if(result){
        this.processScotCat(species, result);
      }
    }, error => {
      console.log(error);
    });
  }

  getMoreFromScott(species, corsFix, scraperURLTHREE, scraperURLFOUR){
    console.log('GET MORE FROM SCOTCAT');

    this.http.get(corsFix + scraperURLTHREE).subscribe( result => {
      if(result){
        this.processMoreScotCat(species, result);
      }
    }, error => {
      console.log(error);
      this.ughTryFourth(species, corsFix, scraperURLFOUR);
    });

    this.howboutFishTanksAndPonds(species)

  }

  ughTryFourth(species, corsFix, scraperURLFOUR){
    this.http.get(corsFix + scraperURLFOUR).subscribe( result => {
      console.log(result);

      if(result){
        this.processMoreScotCat(species, result);
      }

    }, error => {
      console.log(error);
    });
  }

  processMoreScotCat(species, result){
    console.log(species);
    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    console.log(result);

    for(var i in result){

      if(result[i].text.includes('Name')){

        if(result[i].text){
          speciesAddress.set({
            scotsOtherName: result[+i + +1].text
          },{
            merge: true
          });
        }

      }


      if(result[i].text.includes('Family')){

          if(result[i].text){
            speciesAddress.set({
              scotsFamily: result[+i + +1].text
            },{
              merge: true
            });
          }

      }


      if(result[i].text.includes('Distribution')){

          if(result[i].text){
            speciesAddress.set({
              scotsDistribution: result[+i + +1].text
            },{
              merge: true
            });
          }

      }


      if(result[i].text.includes('Size')){

          if(result[i].text){
            speciesAddress.set({
              scotsSize: result[+i + +2].text
            },{
              merge: true
            });
          }

      }

    }

  }

  processScotCat(species, result){

    let speciesAddress;

    if(species['specCode']){
      speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
    }else{
      speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
    }

    //console.log(result);

    for(var i in result){

      if(result[i].text.includes('Characteristics')){

        if(result[i].text){
          speciesAddress.set({
            scotsCharacter: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('Colour')){

        if(result[i].text){
          speciesAddress.set({
            scotsColour: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('Compatibility')){

        if(result[i].text){
          speciesAddress.set({
            scotsCompat: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('Breeding')){

        if(result[i].text){
          speciesAddress.set({
            scotsBreeding: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('Breeding')){

        if(result[i].text){
          speciesAddress.set({
            scotsBreeding: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('Sexual')){

        if(result[i].text){
          speciesAddress.set({
            scotsSex: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('Feeding')){

        if(result[i].text){
          speciesAddress.set({
            scotsFeeding: result[+i + +1].text
          },{
            merge: true
          });
        }

      }

      if(result[i].text.includes('species is called the') || result[i].text.includes('common name of') || result[i].text.includes('name of') || result[i].text.includes('species of')){

        if(result[i].text){
          speciesAddress.set({
            scotsSummary: result[i].text
          },{
            merge: true
          });
        }


      }

      if(result[i].text.includes('water current')){

        if(result[i].text){
          speciesAddress.set({
            scotsHabitat: result[i].text
          },{
            merge: true
          });
        }

      }

    }


    if(result[i].text.includes('native of')){

      if(result[i].text){
        speciesAddress.set({
          scotsDistribution: result[i].text
        },{
          merge: true
        });
      }

    }

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
          if(eachSpecies['fresh'] == 0){
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
    if(!this.saltwater){
      this.typeofTrigger = 'saltwater';
    }else{
      this.typeofTrigger = 'freshwater';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { saltwater: this.saltwater },
      queryParamsHandling: 'merge'
    });

    if(this.popularMode){
      this.loadPopular();
    }
  }

  howboutFishTanksAndPonds(species){
      console.log('Getting fishtanksandponds.co.uk species');

      let name;

      if(species['Species']){
        name = species['Genus'].toLowerCase() + '-' + species['Species'].toLowerCase();
      }else{
        name = species['genus'].toLowerCase() + '-' + species['species'].toLowerCase();
      }

      var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
      var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://www.fishtanksandponds.co.uk/profiles/'+name+'.html&xpath=//div[@id=column_right]/p[0#vws');

      console.log('Running on http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://www.fishtanksandponds.co.uk/profiles/'+name+'.html&xpath=//div[@id=column_right]/p[0#vws')
      console.log('or http://www.fishtanksandponds.co.uk/profiles/'+name+'.html');

      this.http.get(corsFix + scraperURL).subscribe(
      result => {

        console.log(result);

        let speciesAddress;

        if(species['specCode']){
          speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
        }else{
          speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
        }

        for(let i in result){

          if(result[i].html && result[i].html == 'pH'){
            speciesAddress.set({
              pondsUkPH:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkPH'] = result[+i+1].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'dGH'){
            speciesAddress.set({
              pondsUkDgh:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkDgh'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Temperature'){
            speciesAddress.set({
              pondsUkTemp:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkTemp'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Diet'){
            speciesAddress.set({
              pondsUkDiet:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkDiet'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Size'){
            speciesAddress.set({
              pondsUkSize:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkSize'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Min tank size'){
            speciesAddress.set({
              pondsUkTankSize:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkTankSize'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Min tank size'){
            speciesAddress.set({
              pondsUkTankSize:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkTankSize'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Aquarium type'){
            speciesAddress.set({
              pondsUkAquirumType:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkAquirumType'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Origin'){
            speciesAddress.set({
              pondsUkOrigin:result[(+i+2)].text
            },{
              merge: true
            });

            this.species['pondsUkOrigin'] = result[(+i+2)].text
          }

          if(result[i].html && result[i].html == 'Habitat'){
            speciesAddress.set({
              pondsUkHabitat:result[(+i+1)].html.replace(': ', '')
            },{
              merge: true
            });

            this.species['pondsUkHabitat'] = result[(+i+1)].html.replace(': ', '')
          }

          if(result[i].html && result[i].html == 'Classification'){
            speciesAddress.set({
              pondsUkClassification:result[(+i+1)].html
            },{
              merge: true
            });

            this.species['pondsUkClassification'] = result[(+i+1)].html
          }


        }

        console.log(this.species)

        this.getMoreFromPondsUK(name, species)
      }, error => {
        console.log(error);

        this.maybePlanetCatfish(this.sfSpecies);
      });
  }

  getMoreFromPondsUK(name, species){

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://www.fishtanksandponds.co.uk/profiles/'+name+'.html&xpath=//div[@id=column_left]/table/tbody/tr[4]/td[0#vws');

    console.log('Running on http://motyar.info/webscrapemaster/api/?key=williamfische20&url=http://www.fishtanksandponds.co.uk/profiles/'+name+'.html&xpath=//div[@id=column_left]/table/tbody/tr[4]/td[0#vws')
    console.log('or http://www.fishtanksandponds.co.uk/profiles/'+name+'.html');

    this.http.get(corsFix + scraperURL).subscribe(
    result => {

      console.log(result);

      let speciesAddress;

      if(species['specCode']){
        speciesAddress = this.fireStore.doc<any>('Species/' + species['specCode']);
      }else{
        speciesAddress = this.fireStore.doc<any>('Species/' + species['SpecCode']);
      }

      for(let i in result){

        if(result[i].html && result[i].html == 'Etymology:'){
          speciesAddress.set({
            pondsUkEtymology:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkEtymology'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'General Notes:'){
          speciesAddress.set({
            pondsUkSummary:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkSummary'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'Feeding'){
          speciesAddress.set({
            pondsUkFeeding:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkFeeding'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'Sexing'){
          speciesAddress.set({
            pondsUkSexing:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkSexing'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'Breeding'){
          speciesAddress.set({
            pondsUkBreeding:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkBreeding'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'Wild status'){
          speciesAddress.set({
            pondsUkWildStatus:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkWildStatus'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'Compatibility'){
          speciesAddress.set({
            pondsUkCompatibility:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkCompatibility'] = result[+i+1].text;
        }

        if(result[i].html && result[i].html == 'Additional information'){
          speciesAddress.set({
            pondsUkComments:result[(+i+1)].text
          },{
            merge: true
          });

          this.species['pondsUkComments'] = result[+i+1].text;
        }
      }

      this.maybePlanetCatfish(this.sfSpecies);
    }, error => {
      console.log(error);

      this.maybePlanetCatfish(this.sfSpecies);
    });
  }

  switchSalt(){
    if(!this.saltwater){
      this.typeofTrigger = 'saltwater';
    }else{
      this.typeofTrigger = 'freshwater';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { saltwater: this.saltwater },
      queryParamsHandling: 'merge'
    });


    console.log(this.typeofTrigger);
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

      setTimeout(() => {

        if(randomNumber == 0 || !theOne){
          console.log('problem picking species, trying again..')
          this.loadRandom();
        }else{
          if(this.debug){
            console.log('GOT SPECIES #' + randomNumber + ':')
            console.log(theOne)
          }

          this.randomSpecies = theOne;
          this.randomSpeciesCollection.unsubscribe();
          this.checkFavourites(null);
        }

      }, 500)

    });
  }

  checkFavourites(array){

    if(this.afAuth.auth.currentUser){
      this.favouritesCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist').valueChanges().subscribe(values => {

        if(this.speciesSelected){
          values.forEach(eachWishlistSpecies => {
            if(this.species['specCode'] == eachWishlistSpecies['specCode']){
              this.species['isFavourited'] = true
            }
          });

          console.log(this.species)
          this.favouritesCollection.unsubscribe();
        }else if(this.randomSpecies.length >= 1){
          values.forEach(eachWishlistSpecies => {
            if(this.randomSpecies['specCode'] == eachWishlistSpecies['specCode']){
              this.randomSpecies['isFavourited'] = true
            }
          });
        }else{
          if(array && array.length !== 0){
            array.forEach(eachSpecies => {
              values.forEach(eachWishlistSpecies => {
                if(eachSpecies['specCode'] == eachWishlistSpecies['specCode']){
                  eachSpecies['isFavourited'] = true
                }
              });
            });

            console.log(array)
            this.favouritesCollection.unsubscribe();
          }else{
            console.log('error with array collection');
            this.favouritesCollection.unsubscribe();
          }


        }
      });
    }



  }

  seeFullImage(img){
    this.photoViewer.show(img);
  }

  collpasePondSpecies(){
    console.log('Hiding Pond species')

    if(this.showPondSpecies){
      this.showPondSpecies = false;
    }else{
      this.showPondSpecies = true;
    }

  }

  collpaseFishbaseSpecies(){

    console.log('Hiding FishBase species')

    if(this.showFishbaseSpecies){
      this.showFishbaseSpecies = false;
    }else{
      this.showFishbaseSpecies = true;
    }

  }

  collpaseFishbaseRelatedSpecies(){

    console.log('Hiding FishBase Related species')

    if(this.showFishbaseRelatedSpecies){
      this.showFishbaseRelatedSpecies = false;
    }else{
      this.showFishbaseRelatedSpecies = true;
    }

  }

  getAllBettaFish(){
    console.log('Getting all Betta Variations');
    this.bettaVariations = [];

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://www.itsafishthing.com/types-of-betta-fish&xpath=//article[@id=post-2086]/div/div/h3#vws');

    this.http.get(corsFix + scraperURL).subscribe(
      result => {

        for(var i in result){
          this.bettaVariations[i] = result[i].text;
        }

        // result.forEach(function(value) {
        //
        // }, () => {
        //   console.log('BETTAS DONE')
        // });

        console.log(this.bettaVariations)
    }, error => {
      console.log(error);
    });
  }

  bettaLink(fish){

    if(fish){
      console.log(fish.toLowerCase());

      let uppercaseFish = fish.toLowerCase().replace(/%20/g, '-').replace(/ /g, '-')
      let fixedFish = uppercaseFish.replace(/\-\-/g, '-').replace('-/', '').replace(/&amp;/g, '').replace(/\(/g, '').replace(/\)/g, '')

      console.log('Showing ' + 'https://www.itsafishthing.com/types-of-betta-fish/#' + fixedFish)

      this.iab.create('https://www.itsafishthing.com/types-of-betta-fish/#' + fixedFish);
    }
  }

  showLNumGuide(){
    this.iab.create('https://www.planetcatfish.com/catelog/numbers.php?mode=l&thumbs=600&offset=0&genus_id=0');
  }

  generateLNumSpecies(searchQuery){
    console.log('Getting L Number Variation');

    var corsFix = 'https://api.codetabs.com/v1/proxy?quest=';
    var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?key=williamfische20&url=https://en.wikipedia.org/wiki/L-number&xpath=//div[@id=mw-content-text]/div/table/td#vws');

    this.http.get(corsFix + scraperURL).subscribe(
      result => {
        let newArr = [];
        let oldArr = [];

        for(var i in result){
          if(result[i].text.length !== 0 && !result[i].text.includes('pleco') && !result[i].text.includes('bristlenose')){
            oldArr.push(result[i].text)
          }
        }

        //console.log(oldArr);

        for(var i in oldArr){
          if(oldArr[i].toLowerCase().includes(this.searchQuery)){
            let secondOBJNUM = +i + 1;
            console.log(oldArr[i] + ' is ' + oldArr[secondOBJNUM])
            newArr.push(oldArr[secondOBJNUM].replace(' sp.', ''))
          }
        }

        this.possibleLNum = newArr[0];
        console.log(newArr[0])

    }, error => {
      console.log(error);
    });
  }


  checkUserBase(searchQuery){

    console.log('### CHECK FOR USERS ###');

    this.userBaseCollection = this.fireStore.collection('Users').valueChanges().subscribe(values => {
      //console.log(values);
      let users = [];

      for(var i in values){
        let value = values[i];

        if(value['name'].toLowerCase() == this.searchQuery || value['email'].toLowerCase() == this.searchQuery){
          users.push(value)

        }
      }

      if(users && users.length != 0){
        console.log(users)

        var orderedUsers = users.sort((a, b) => b['fishCount'] - a['fishCount']);
        this.usersFound = orderedUsers;

        //this.allLocalFish.push(orderedUsers);

      }else{
        console.log('No users found...')
      }

      this.userBaseCollection.unsubscribe();
    });
  }

  imgError(img, id) {
    console.log(id);

    img.style.display == 'none';

    if(id == '0'){
      console.log(id + " not loaded, loading 1 instead")
    }else if(id == '1'){
      console.log(id + " not loaded, loading 1 instead")
    }

  }

  checkFishVersionCode(fish){
    console.log(fish);

    if(fish['versionCode']){

      if(this.debug){
        console.log('Species is v' + fish['versionCode'] + ' runnning version is v' + this.runningVersion);
      }

      if(fish['versionCode'] !== this.runningVersion && fish['temperature']){
        console.log('Seriosuly Fish update required.... updating to ' + this.runningVersion);

        this.presentUpdating();

        this.updatingSpecies = true;
        this.refreshRequired = true;

        this.updateSpeciesVCode(fish, this.runningVersion);
        //this.clearSpeciesCount(fish);

        this.theInternetIsMyBitchAndShesBeenABadGirl(fish);
      }else if(fish['versionCode'] !== this.runningVersion){
        console.log('Version update required...');

        this.updatingSpecies = true;

        this.updateSpeciesVCode(fish, this.runningVersion);

        if(this.saltwater){
          this.presentUpdating();
          this.perhapsReefApp(fish);
        }

        this.howboutFishTanksAndPonds(fish);

      }else{
        console.log('Species up to date!');
        //this.presentLoading();
      }

    }else if (fish['Modified']){
      console.log('Fish is new perhaps, leaving as is..');

      //this.presentLoading();
    }else{
      console.log('Fish lacks version code');
      //this.presentLoading();

      this.setSpeciesVCode(fish);
    }

  }

  setSpeciesVCode(fish){
    let speciesAddress = this.fireStore.doc<any>('Species/' + fish['specCode'])

    speciesAddress.set({
      versionCode:'0.0.1'
    },{
      merge: true
    }).then(() => {
      fish['versionCode'] = '0.0.1';
      this.checkFishVersionCode(fish);
    });

    console.log('Version set to v0.0.1')
  }

  updateSpeciesVCode(fish, version){

    console.log(fish);
    console.log(this.species);

    this.species = fish;

    let specCode = '';

    if(fish['SpecCode']){
      specCode = fish['SpecCode']
    }else{
      specCode = fish['specCode']
    }

    if(specCode){
      let speciesAddress = this.fireStore.doc<any>('Species/' + specCode)

      speciesAddress.set({
        versionCode: version
      },{
        merge: true
      }).then(() => {
        fish['versionCode'] = version;
      });

      console.log('Version set to v' + version);

    }else{
      console.log('UPDATE ERROR');
      //this.checkFishVersionCode(fish)
    }
  }

  clearSpeciesCount(fish){
    let speciesAddress = this.fireStore.doc<any>('Species/' + fish['specCode'])

    speciesAddress.set({
      viewCount: 1
    },{
      merge: true
    }).then(() => {
      console.log('Species view count reset.')
    });
  }

  showUser(user){
    this.router.navigateByUrl('/users/' + user['uid']);
  }

}
