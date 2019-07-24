import { Component, ViewChild } from '@angular/core';
import { IonContent, AlertController, ModalController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs/operators';
import { AddVariationModelPage} from '../add-variation-model/add-variation-model.page';
import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})

export class Tab3Page {

  @ViewChild(IonContent) content: IonContent;

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
  searchQuery: string = '';
  selectedLetter: string = '';
  selectedTempTank: any;
  fullWikiText: boolean;
  species : any = [{
    name : '',
    species : '',
    genus : '',
  }];
  variations : any = []
  image: any = [];
  speciesVunFloored;
  speciesImgArray: any = [];
  letterCounter: any = [];
  fbSpecies: any = [];
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
  googleImageArray: any = [];
  minSpeciesReturn = 0;
  maxSpeciesReturn = 10;
  detailedFishInformation : any = [];
  planetCatfishInformation: any = [];

  constructor(
    private http:HttpClient,
    public fireStore: AngularFirestore,
    private modalCtrl:ModalController,
    public afAuth: AngularFireAuth,
    private keyboard: Keyboard,
    public loadingController: LoadingController){

  }

  ngOnInit() {
    //console.clear();

    var slides = document.querySelector('ion-slides');

    if(slides){
      slides.options = {
        initialSlide: 1,
        speed: 400
      }
    }

  }


  // COMMANDER
  checkAPI($event, autoQuery){
      this.keyboard.hide();
      console.clear();
      this.speciesSelected = false;

      if(autoQuery.length >= 1){
        var searchQuery = autoQuery;
      }else{
        var searchQuery = $event.srcElement.value;
      }


      this.searchQuery = searchQuery;
      this.selectLetter = this.selectLetter;
      this.fbSpecies = [];
      this.ourFish = [];
      this.relatedSpecies = [];
      this.speciesImgArray = [];
      this.googleImageArray = [];
      this.fullImageCollection = [];
      this.species = [];

      if(searchQuery.length > 2){
        // console.log('Running API for ' + searchQuery + '...');

        this.doneLoading = false;
        this.displayFirebase(searchQuery);

        // this.checkFirebase(searchQuery);

      }else{
        console.log('Query length is too short.')
      }
  }

  clearSearch(){
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
  }


  showGenus(genus){
    this.speciesSelected = false;
    this.checkAPI(false, genus);
    this.searchQuery = genus;
    this.doneLoading = false;
  }

  // Access detail page and save selected species
  selectSpecies(fish, inDB){


    this.speciesImgArray = [];
    this.fullImageCollection = [];
    this.species = [];
    this.speciesSelected = true;

    //console.log(fish);

    this.coreCollection.unsubscribe();

    setTimeout(()=>{
      if(this.speciesCollection)
      this.speciesCollection.unsubscribe();
      if(this.speciesImagesCollection)
      this.speciesImagesCollection.unsubscribe();
    }, 3000);

    if(this.recheckerCollection){
      this.recheckerCollection.unsubscribe();
    }

    if(this.recheckFirebaseDB){
      this.recheckFirebaseDB.unsubscribe();
    }

    if(!inDB){
      console.clear();

      console.log("NEW TO SYSTEM... ADDING");

      this.isItReallyNewTho(fish);


    }else{
      console.log('########################');
      console.log('Showing existing fish...');

      var specCode;

      if(!fish['specCode']){
        specCode = fish['SpecCode']
      }else{
        specCode = fish['specCode']
      }

      this.populateSpecies(specCode);

      this.speciesDonePopulating();
    }

    this.content.scrollToTop(400);
  }

  isItReallyNewTho(fish){
    console.log('### VERIFYING FISH IS REALLY NEW ###');

    //console.log(fish['SpecCode'])

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

        this.presentNewSpeciesLoading();
        this.getMoreGoogleImages(fish);

        setTimeout(()=>{

          if(fish){
            this.theInternetIsMyBitchAndShesBeenABadGirl(fish);
          }
        }, 3500);

      }else{
        console.log('FISH EXITS');

        this.selectSpecies(fish, true)
      }
    });

  }

  populateSpecies(specCode){
    //console.log(specCode);

    this.speciesCollection = this.fireStore.doc('Species/' + specCode).valueChanges().subscribe(values => {
      this.species = values;
      //console.log(this.species);

      if(!this.species){
        alert('Error collecting species, please try again...')
        this.clearSearch();
      }else{
        setTimeout(()=>{
          this.speciesImagesCollection = this.fireStore.collection('Species/' + specCode + '/Pic').valueChanges().subscribe(values => {
            values.forEach(eachImg => {
              //console.log(eachImg['url']);
              this.speciesImgArray.push(eachImg['url'])
            });

            //console.log(this.speciesImgArray);
          });
        }, 1000);


        if(values['vulnerability']){
          this.speciesVunFloored = Math.floor(values['vulnerability']);
        }
      }



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
  }

  nextPage(){
    this.minSpeciesReturn = this.minSpeciesReturn + 11;
    this.maxSpeciesReturn = this.maxSpeciesReturn + 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

    // slicedSpecies.forEach(function(value, key) {
    //   this.getGoogleImages(value, key, false);
    // });
    //

    slicedSpecies.forEach(obj => {
      if(obj['id'] >= this.minSpeciesReturn && obj['id'] <= this.maxSpeciesReturn){
        this.getGoogleImages(obj)
        console.log('generated')
      }else{
        console.log('not generated')
      }
    });


    this.content.scrollToTop(400);
  }

  previousPage(){
    this.minSpeciesReturn = this.minSpeciesReturn - 11;
    this.maxSpeciesReturn = this.maxSpeciesReturn - 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

    // slicedSpecies.forEach(function(value, key) {
    //   this.getGoogleImages(value, key, false);
    // });

    slicedSpecies.forEach(obj => {
      if(obj['id'] >= this.minSpeciesReturn && obj['id'] <= this.maxSpeciesReturn){
        this.getGoogleImages(obj)
      console.log('generated')
      }else{
        console.log('not generated')
      }
    });

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
          if(lowerQuery ==  eachObj['name'] || lowerQuery ==  eachObj['genus']  || lowerQuery ==  eachObj['species'] ){
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
          this.populateFirebaseImages(searchQuery);

          this.runFishbaseChecker(searchQuery);
        }else{
          //console.log('no local species')
          this.runFishbaseChecker(searchQuery);
        }


      });
    }

  }

  populateFirebaseImages(searchQuery){
    console.log("### LOADING IMAGES FROM OUR FIREBASE ###")

    var fishCount = 0;

    this.ourFish.forEach(value => {
      var images = [];

      this.fireStore.collection('Species/' + value['specCode'] + '/Pic').valueChanges().subscribe(
        eachObj => {
        eachObj.forEach(urlObj => {
          images.push(urlObj['url']);
        });
      });

      this.ourFish[fishCount]['Pic'] = images;
      fishCount++;
    });

    console.log(this.ourFish);



  }

  displayFishbase(result, searchQuery){
    var loopValue = result['data']
    var arrayLength = 0;
    var speciesArray = [];
    this.image = [];

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

    console.log(clearOfDups);

    if(clearOfDups){
      clearOfDups.forEach(function(value, key) {
        //console.log(key, value)
        clearOfDups[key]['id'] = key;
      });

      clearOfDups.forEach(eachObj => {
        if(eachObj['id'] <= 10){
          this.getGoogleImages(eachObj)
            console.log('generated')
        }else{
          console.log('not generated')
        }

      });

      console.log('Images Generated');
      this.fbSpecies = clearOfDups;
    }


    this.checkCommNames(searchQuery);
  }


  // CHECK API AGAINST THE COMMON FISHBASE DATABASE
  checkCommNames(searchQuery){
    console.log("### CHECKING FISHBASE/COMMON NAMES ###")

    this.http.get('https://fishbase.ropensci.org/comnames?ComName=' + searchQuery + '&limit=500').subscribe(
        result => {
          // Handle result
          var loopableResults = result['data'];

          var clearOfDups = this.removeDuplicatesBy(x => x.SpecCode, loopableResults);
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

          setTimeout(()=>{
            this.generateRelatedImages()
          }, 3000);

          this.areYouSureTheseArentInTheDatabase();

        }, error => {
          console.log("ALL MATCHES FAILED ON COMMON NAMES");
          this.relatedSpecies = [];
          this.everythingsDone();
    });


  }


  populateRelatedSpecies(subSpecies, key){

    if(this.fbSpecies.length >= 1){
      this.fbSpecies.forEach(mainSpecies => {

        // CHECK THAT SPECIES ISNT ALREADY LISTED IN MAIN DB
        if(subSpecies['SpecCode'] != mainSpecies['SpecCode']){

          if(this.ourFish.length >= 1){
            // CHECK THAT SPECIES ISNT ALREADY LISTED IN OUR DB
            this.ourFish.forEach(ourFish => {
              //console.log(ourFish['specCode'] + " VS " + subSpecies['SpecCode'])
              if(ourFish['specCode'] == subSpecies['SpecCode']){}else{
                this.getFullFishResult(subSpecies);
              }
            });
          }else{
            this.getFullFishResult(subSpecies);
          }

        }else{}

      });
    }else{
      //console.log("No main species to check related species against.")

      if(this.ourFish.length >= 1){
        // CHECK THAT SPECIES ISNT ALREADY LISTED IN OUR DB
        this.ourFish.forEach(ourFish => {
          if(ourFish['specCode'] == subSpecies['SpecCode']){}else{
            this.getFullFishResult(subSpecies);
          }
        });
      }else{
        console.log("No local species to check related species against.")

        this.getFullFishResult(subSpecies);
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

  getFullFishResult(species){
    var theSpecCode = species['SpecCode']

    this.http.get('https://fishbase.ropensci.org/species?SpecCode=' + theSpecCode + '&limit=1').subscribe(
      result => {
        var pushResults = result['data'][0];

        //console.log("Getting full result for " + pushResults['Species'])

        if(!this.saltwater){
          if(pushResults['Fresh'] == -1 && pushResults['Species'] !== 'rasbora'){
            this.relatedSpecies.push(pushResults);
          }
        }else{
          if(pushResults['Fresh'] != -1){
            this.relatedSpecies.push(pushResults);
          }
        }

      });
  }

  generateRelatedImages(){
    console.log('### GENERATING RELATED IMAGES ###');
    var counter = 0;

    this.relatedSpecies.forEach(relatedFish => {
      //console.log(counter);

      if(counter <= 10){
        this.getGoogleImages(relatedFish);
      }

      counter++;
    });

    console.log('Images Generated');

    this.everythingsDone();

  }


  areYouSureTheseArentInTheDatabase(){
    console.log("### RECHECKING LOCAL DATABASE ###");

    setTimeout(()=>{
        this.recheckerCollection = this.fireStore.collection('Species').valueChanges().subscribe(values => {
          values.forEach(localSpecies => {
            //this.ourFish.forEach(ourFishSpecies => {
              //console.log(localSpecies['specCode'] +" VS "+ ourFishSpecies['specCode']);

              if(this.fbSpecies.length != 0){
                this.fbSpecies.forEach(species => {
                  if(localSpecies['specCode'] == species['SpecCode']){
                    if(!this.saltwater){
                      if(localSpecies['fresh'] == -1){
                        this.pushOurFishSpecies(localSpecies);
                      }
                    }else{
                      if(localSpecies['fresh'] != -1){
                        this.pushOurFishSpecies(localSpecies);
                      }
                    }
                  }
                });

                if(this.relatedSpecies.length != 0){
                  this.relatedSpecies.forEach(species => {
                    if(localSpecies['specCode'] == species['SpecCode']){
                      if(!this.saltwater){
                        if(localSpecies['fresh'] == -1){
                          this.pushOurFishSpecies(localSpecies);
                        }
                      }else{
                        if(localSpecies['fresh'] != -1){
                          this.pushOurFishSpecies(localSpecies);
                        }
                      }
                    }
                  });
                }

              }

          });
          //});



          if(this.ourFish.length >= 1){
            console.log(this.ourFish)
            this.populateFirebaseImages(this.searchQuery);
            this.removeOurDuplicates();
          }else{
            console.log('Nope, no local species im sure of it!')
          }


        });


    }, 1000);




  }

  pushOurFishSpecies(localSpecies){
    this.ourFish.push(localSpecies);
    // this.ourFish.forEach(myfish => {
    //   if(localSpecies['specCode'] != myfish['specCode']){
    //
    //   }
    // });
  }

  removeOurDuplicates(){
    console.log("### REMOVING ANY LOCAL SPECIES THAT EXISTS IN FIREBASE ###");
    this.ourFish.forEach(ourfish => {

      // FISHBASE
      this.fbSpecies.forEach(fbfish => {
        if(ourfish['specCode'] == fbfish['SpecCode']){
          console.log(fbfish)
          this.fbSpecies.splice(fbfish['id'])
        }
      });

    });
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
    console.log("### CHECKING GENERAL FISHBASE ###")
    this.http.get('https://fishbase.ropensci.org/species?FBname=' + searchQuery + '&limit=500').subscribe(
      result => {
        // Handle result

        this.displayFishbase(result, searchQuery);

      },
      error => {
        this.http.get('https://fishbase.ropensci.org/species?Genus=' + searchQuery + '&limit=500').subscribe(
          result => {
            // Handle result
            this.displayFishbase(result, searchQuery);
          },
          error => {
            this.http.get('https://fishbase.ropensci.org/species?Species=' + searchQuery + '&limit=500').subscribe(
              result => {
                // Handle result
                this.displayFishbase(result, searchQuery);
              },
              error => {
                console.log("ALL MATCHES FAILED ON SPECIES, GENUS & NAME");
                this.fbSpecies = [];
                this.checkCommNames(searchQuery);
              }
            );
          });
        });

  }



  // ADD SPECIES TO FIREBASE DATABASE FOR LATER
  addToDatabase(fish){
    console.log("### ADDING SPECIES TO DATABASE ###")

    let speciesAddress = this.fireStore.doc<any>('Species/' + fish.SpecCode);

    var commName = '';

    if(fish.FBname){
      commName = fish.FBname
    }else{
      commName = fish.Genus + " " + fish.Species;
    }

    var proccessedComments = fish.Comments.replace(/ *\([^)]*\) */g, "").replace(/ *\<[^>]*\) */g, "");

    console.log(fish);

    speciesAddress.set({
      name: commName.toLowerCase(),
      species: fish.Species.toLowerCase(),
      fishBaseImg: fish.PicPreferredName,
      genus: fish.Genus.toLowerCase(),
      comments: proccessedComments,
      dangerous: fish.Dangerous,
      length: fish.Length,
      genCode: fish.GenCode,
      specCode: fish.SpecCode,
      SpeciesRefNo: fish.SpeciesRefNo,
      vulnerability: fish.Vulnerability,
      fresh: fish.Fresh
    });


    // SAVE PHOTOS TO DATABASE
    var counter = 0;

    this.googleImageArray.forEach(eachObj => {
      var speciesPicArray = this.fireStore.doc<any>('Species/' + fish.SpecCode + "/Pic/" + counter);
      speciesPicArray.set({
        url: eachObj
      })

      counter++
    });

    var specCode = fish['SpecCode']
    this.populateSpecies(specCode);

  }

  plantSearch(searchquery){

  }

  // GENERATE IMAGES FROM GOOGLE FOR INDIVIDUAL SPECIES
  getMoreGoogleImages(fish){
    console.log('### GENERATING 10 GOOGLE IMAGES ###');
    //console.log(this.googleImageArray);

    // if(fish['genus']){
    //   var searchName = fish['genus'] + " " + fish['species'];
    // }else{
    //var searchName = fish['Genus'] + " " + fish['Species'];
    // }

    //console.log(fish)

    this.http.get('https://www.googleapis.com/customsearch/v1?q='+ fish['Genus'] + "%20" + fish['Species'] + '&searchType=image&num=10&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
      result => {
        this.fullImageCollection.push(result['items']);
      }, error => {
        console.log(error)
      }, () => {
      console.log(this.fullImageCollection);
      this.fullImageCollection.forEach(eachObj => {
        //console.log(eachObj);
        eachObj.forEach(eachObj2 => {
          if(eachObj2['link'] && eachObj2['displayLink'] != 'en.wikipedia.org' && eachObj2['displayLink'] != 'www.shutterstock.com' && eachObj2['displayLink'] != 'www.fishbase.us' && eachObj2['displayLink'] != 'www.seriouslyfish.com' && eachObj2['displayLink'] != 'www.facebook.com'){
            this.googleImageArray.push(eachObj2['link']);
          }

        });
      });

      //console.log(this.googleImageArray);
      this.addToDatabase(fish);

    });``
  }


  // GENERATE IMAGES FROM GOOGLE FOR CARDS
  getGoogleImages(obj){

    var imageArr = [];

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
        });
      }, 1000);

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
      this.showTankListTick = false;

      let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'] + '/species/' + this.toAddToTankSpecies['specCode']);

      var scientificName = this.toAddToTankSpecies['genus'] + " " + this.toAddToTankSpecies['species']
      tankAddress.set({
        dateSet: new Date(),
        name: this.toAddToTankSpecies['name'],
        specCode: this.toAddToTankSpecies['specCode'],
        sciName: scientificName
      });

      console.log("Species added to tank!")

      this.showTankQuanityList = true;

      this.selectedTempTank = tank

    }

    setSpeciesTankQuantity(speciesCount){
      this.showTankListLoader = true;

      let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.selectedTempTank['name'] + '/species/' + this.toAddToTankSpecies['specCode']);

      tankAddress.update({
        quantity: speciesCount
      });

      setTimeout(()=>{
        this.showTankListLoader = false;
        this.showTankListTick = true;

        setTimeout(()=>{
          this.showSelectTank = false;
          this.selectedTempTank = '';
        }, 1000);
      }, 1000);



    }

    hideTankMenu(){
      this.showSelectTank = false;
    }

    selectLetter(letter){
      this.letterCounter = [];
      this.selectedLetter = letter;
      console.log('Searching For all ' + letter + '\'s in ' + this.searchQuery + '')

      if(this.fbSpecies.length >= 1){
        this.fbSpecies.forEach(species => {
          var speciesLetter = species['Species'].charAt(0).toUpperCase();
          var genusLetter = species['Genus'].charAt(0).toUpperCase();
          var nameLetter;

          if(species['FBname']){
            nameLetter = species['FBname'].charAt(0).toUpperCase();
          }else{
            nameLetter = '';
          }

          var selectedLetter = letter.toUpperCase();

          if(speciesLetter == selectedLetter || genusLetter == selectedLetter || nameLetter == selectedLetter){
            this.letterCounter.push(species)
          }
        });
      }

      if (this.relatedSpecies.length >= 1){
        this.relatedSpecies.forEach(species => {
          var speciesLetter = species['Species'].charAt(0).toUpperCase();
          var genusLetter = species['Genus'].charAt(0).toUpperCase();
          var nameLetter;

          if(species['FBname']){
            nameLetter = species['FBname'].charAt(0).toUpperCase();
          }else{
            nameLetter = '';
          }

          var selectedLetter = letter.toUpperCase();

          if(speciesLetter == selectedLetter || genusLetter == selectedLetter || nameLetter == selectedLetter){
            this.letterCounter.push(species)
          }
        });
      }

      console.log(this.letterCounter);
      this.letterCounter.forEach(function(value, key) {
        this.getGoogleImages(value, key, false);
      });

    }

    clearLetter(){
      this.letterCounter = [];
      this.selectedLetter = '';
    }

    async addVariation(species){
      console.log('Opening Variation Model')
      const showAddVariationModal = await this.modalCtrl.create({
       component: AddVariationModelPage,
       componentProps: { species: species }
     });

     return await showAddVariationModal.present();
    }

    getVariations(species){
      var specCode = species['specCode'];

      this.fireStore.collection('Species/' + specCode + "/Variations").valueChanges().subscribe(values => {
        this.variations = values;
      });

    }


    theInternetIsMyBitchAndShesBeenABadGirl(species){
      console.log('### RUNNING SERIOUSLY FISH WEB SCRAPER ###');
      console.log(species)

      if(species['species']){
        var searchParam = species['genus'] + '-' + species['species'];
        console.log('Searching for ' + searchParam);
      }else if(species['Species']){
        var searchParam = species['Genus'] + '-' + species['Species'];
        console.log('Searching for ' + searchParam);
      }else{
        console.log('Scraper failed to load species...')
      }

      var corsFix = 'https://bypasscors.herokuapp.com/api/?url=';
      var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=https://www.seriouslyfish.com/species/'+searchParam+'/&xpath=p');

      //console.log('running on ' + scraperURL)

      this.http.get(corsFix + scraperURL).subscribe(
        result => {

          var res = [];
          for (var x in result){
             result.hasOwnProperty(x) && res.push(result[x])
          }

          var detailedFishInformation = []

          console.log('### OUTPUT ###')
          console.log(res);

          res.forEach(function(value, key) {

            if(value['text'].includes('Sorry, we couldn\'t find the page you were looking for.')){
              console.log('SERIOUSLY FISH CANNOT FIND THIS SPECIES');
            }else{

              if(value['text'].includes('Temperature')){
                // console.log('--- Temperature of species: ---');
                // console.log(value['text']);
                var temp = value['text'].replace('Temperature:','').replace('C','').replace('&deg;','').replace('&deg;','').replace('&#8211;','-').replace(/\s/g,'');
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

              if(value['text'].includes('base dimensions') || value['text'].includes('An aquarium measuring') || value['text'].includes('An aquarium with a base measuring')){
                // console.log('--- Recommended Tank Size of species: ---');
                // console.log(value['text']);
                detailedFishInformation['tankSize'] = value['text'];
              }

              if(value['text'].includes('Nigeria') || value['text'].includes('Guinea')){
                // console.log('--- Recommended Tank Size of species: ---');
                // console.log(value['text']);
                detailedFishInformation['locality'] = value['text'];
              }


              // if(value['text'].includes('substrate')){
              //   // console.log('--- Recommended Substrate of species: ---');
              //   // console.log(value['text']);
              //   detailedFishInformation['substrate'] = value['text'];
              // }

              if(value['text'].includes('Sexually')){
                // console.log('--- Sexual Identification of species: ---');
                // console.log(value['text']);
                detailedFishInformation['sexIdentification'] = value['text'];
              }

              if(value['text'].includes('inhabits')){
                // console.log('--- Habitat of species: ---');
                // console.log(value['text']);
                detailedFishInformation['habitat'] = value['text'];
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
            console.log(detailedFishInformation);
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
        speciesAddress.update({
          temperature:this.detailedFishInformation['temperature']
        });
      }

      if(this.detailedFishInformation['ph']){
        speciesAddress.update({
          ph:this.detailedFishInformation['ph']
        });
      }

      if(this.detailedFishInformation['hardness']){
        speciesAddress.update({
          hardness:this.detailedFishInformation['hardness']
        });
      }

      if(this.detailedFishInformation['size']){
        speciesAddress.update({
          SFFishSize:this.detailedFishInformation['size']
        });
      }

      if(this.detailedFishInformation['tankSize']){
        speciesAddress.update({
          recommendedTankSize:this.detailedFishInformation['tankSize']
        });
      }

      // if(this.detailedFishInformation['substrate']){
      //   speciesAddress.update({
      //     recommendedSubstrate: this.detailedFishInformation['substrate']
      //   });
      // }

      if(this.detailedFishInformation['sexIdentification']){
        speciesAddress.update({
          sexIdentificationFeatures:this.detailedFishInformation['sexIdentification']
        });
      }

      if(this.detailedFishInformation['locality']){
        speciesAddress.update({
          locality:this.detailedFishInformation['locality']
        });
      }

      if(this.detailedFishInformation['habitat']){
        speciesAddress.update({
          habitat:this.detailedFishInformation['habitat']
        });
      }

      if(this.detailedFishInformation['blackWater']){
        speciesAddress.update({
          blackWater:this.detailedFishInformation['blackWater']
        });
      }

      if(this.detailedFishInformation['aquaticPlants']){
        speciesAddress.update({
          aquaticPlants:this.detailedFishInformation['aquaticPlants']
        });
      }

    }


    maybePlanetCatfish(species){
      console.log('### RUNNING PLANT CATFISH WEB SCRAPER ###');
      //console.log(species)

      if(species['species']){
        var searchParam = species['genus'] + '_' + species['species'];
        console.log('Searching for ' + searchParam);
      }else if(species['Species']){
        var searchParam = species['Genus'] + '_' + species['Species'];
        console.log('Searching for ' + searchParam);
      }else{
        console.log('Scraper failed to load species...')
      }

      var corsFix = 'https://bypasscors.herokuapp.com/api/?url=';
      var urlchanger = 'http://expandurl.com/api/v1/?url=https://www.planetcatfish.com/' + searchParam

      console.log(corsFix + urlchanger)
      this.http.get(corsFix + urlchanger).subscribe(result => {}, error => {
        //console.log(error.error['text']);
        var scraperURL = encodeURIComponent('http://motyar.info/webscrapemaster/api/?url=' + error.error['text'] +'/&xpath=tr');

        //console.log('running on ' + scraperURL)

        this.http.get(corsFix + scraperURL).subscribe(result => {
          if(result){
            this.processPlanetCatfish(result, species);
          }else{
            console.log('Species dosen\'t exist in Planet Catfish :( ');
            this.newSpeciesDonePopulating(species)
          }

        }, error => {
            console.log('Species dosen\'t exist in Planet Catfish :( ');
            this.newSpeciesDonePopulating(species)
        });
      });

    }

    processPlanetCatfish(result, species){
      console.log(result)

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
          var processedTemp = eachTxt['text'].replace('Temperature','').replace(/&deg;/g, '°').replace('(Show species within this range)', '').trim();
          // console.log('Temperature: '+ processedTemp)
          planetCatfishInformation['temp'] = processedTemp;
        }
      });

      console.log(planetCatfishInformation);
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

      if(this.planetCatfishInformation['ph']){
        speciesAddress.update({
          ph:this.planetCatfishInformation['ph']
        });
      }
      if(this.planetCatfishInformation['locality']){
        speciesAddress.update({
          locality:this.planetCatfishInformation['locality']
        });
      }
      if(this.planetCatfishInformation['etymology']){
        speciesAddress.update({
          etymology:this.planetCatfishInformation['etymology']
        });
      }
      if(this.planetCatfishInformation['size']){
        speciesAddress.update({
          size:this.planetCatfishInformation['size']
        });
      }
      if(this.planetCatfishInformation['identification']){
        speciesAddress.update({
          identification:this.planetCatfishInformation['identification']
        });
      }
      if(this.planetCatfishInformation['sexing']){
        speciesAddress.update({
          sexing:this.planetCatfishInformation['sexing']
        });
      }
      if(this.planetCatfishInformation['distribution']){
        speciesAddress.update({
          distribution:this.planetCatfishInformation['distribution']
        });
      }
      if(this.planetCatfishInformation['feeding']){
        speciesAddress.update({
          feeding:this.planetCatfishInformation['feeding']
        });
      }
      if(this.planetCatfishInformation['furniture']){
        speciesAddress.update({
          furniture:this.planetCatfishInformation['furniture']
        });
      }
      if(this.planetCatfishInformation['compatibility']){
        speciesAddress.update({
          compatibility:this.planetCatfishInformation['compatibility']
        });
      }
      if(this.planetCatfishInformation['tankMates']){
        speciesAddress.update({
          tankMates:this.planetCatfishInformation['tankMates']
        });
      }
      if(this.planetCatfishInformation['temp']){
        speciesAddress.update({
          temperature:this.planetCatfishInformation['temp']
        });
      }

      this.searchWikipedia(species)


    }

    speciesDonePopulating(){
      setTimeout(()=>{
        this.speciesLoaded = true;
        this.speciesDataLoaded = true;
      }, 2500);
    }

    newSpeciesDonePopulating(fish){
      console.log("SPECIES ADDED TO SYSTEM");
      this.dismissNewSpeciesLoading();
      this.selectSpecies(fish, true);
    }

    everythingsDone(){
      console.log('everythings done...')

      setTimeout(()=>{
        this.doneLoading = true;

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
      }, 2000);

    }

    async presentNewSpeciesLoading() {
      this.isLoadingNewSpecies = true;
      return await this.loadingController.create({
        message: 'This species is new! Adding to system...'
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
      return await this.loadingController.dismiss().then(() => console.log('dismissed'));

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
        var searchName = fish['genus'] + " " + fish['species'];
      }else{
      var searchName = fish['Genus'] + " " + fish['Species'];
      }

      //var corsFix = 'https://bypasscors.herokuapp.com/api/?url=';
      this.http.get('https://en.wikipedia.org/w/api.php?origin=*&format=json&action=query&prop=extracts&exintro&explaintext&indexpageids&redirects=1&titles=' + searchName).subscribe(
        result => {
          var wikiLink = result['query'].pages;
          console.log(wikiLink)

          for (var i in wikiLink) {
            var extract = wikiLink[i].extract;

            if(!extract){
              console.log('Species couldn\'t be located')
            }else{
              var title = wikiLink[i].title;

              speciesAddress.update({
                wikiDesc:extract,
                wikiName:title
              });
            }
          }

      }, error => {
        console.log(error)
      });

      this.newSpeciesDonePopulating(fish)

    }

    seeFulText(){
      this.fullWikiText = true;
    }

    seeLessText(){
      this.fullWikiText = false;
    }
}
