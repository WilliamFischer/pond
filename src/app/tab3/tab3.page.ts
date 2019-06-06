import { Component, ViewChild } from '@angular/core';
import { IonContent, AlertController } from '@ionic/angular';
import { Keyboard } from '@ionic-native/keyboard/ngx';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs/operators';

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
  showTankListLoader: boolean;
  showTankListTick: boolean;
  saltwater: boolean;
  searchQuery: string = '';
  selectedLetter: string = ''
  species : any = [{
    name : '',
    species : '',
    genus : '',
  }];
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
  googleImageArray: any = [];
  counter: number = 0;
  rcounter: number = 0;
  minSpeciesReturn = 0;
  maxSpeciesReturn = 10;

  constructor(
    private http:HttpClient,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private keyboard: Keyboard){

  }

  ngOnInit() {
    console.clear();

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
      this.speciesSelected = false;

      if(autoQuery.length >= 1){
        var searchQuery = autoQuery;
      }else{
        var searchQuery = $event.srcElement.value;
      }

      this.searchQuery = searchQuery;

      this.fbSpecies = [];
      this.ourFish = [];
      this.relatedSpecies = [];
      this.counter = 0;
      this.rcounter = 0;
      this.speciesImgArray = [];
      this.googleImageArray = [];
      this.fullImageCollection = [];
      this.species = [];
      this.letterCounter = [];
      this.selectedLetter = '';

      if(searchQuery.length > 2){
        // console.log('Running API for ' + searchQuery + '...');

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
    this.counter = 0;
    this.rcounter = 0;
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
  }

  // Access detail page and save selected species
  selectSpecies(fish, inDB){
    console.clear();

    this.speciesImgArray = [];
    this.fullImageCollection = [];
    this.species = [];
    this.speciesSelected = true;

    if(!inDB){
      console.log("NEW TO SYSTEM... ADDING")
      this.coreCollection.unsubscribe();
      this.getMoreGoogleImages(fish);


    }else{
      console.log('Showing existing fish...');
      this.coreCollection.unsubscribe();

      var specCode = fish['specCode']
      this.populateSpecies(specCode);
    }

  }

  populateSpecies(specCode){
    //console.log(specCode);

    this.fireStore.doc('Species/' + specCode).valueChanges().subscribe(values => {
      this.species = values;
      console.log(this.species);

      this.fireStore.collection('Species/' + specCode + '/Pic').valueChanges().subscribe(values => {
        values.forEach(eachImg => {
          //console.log(eachImg['url']);
          this.speciesImgArray.push(eachImg['url'])
        });

        //console.log(this.speciesImgArray);
      });


      if(values['vulnerability']){this.speciesVunFloored = Math.floor(values['vulnerability']);}

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
    var searchQuery = this.searchQuery;
    this.checkAPI(null, searchQuery);
  }

  nextPage(){
    this.minSpeciesReturn = this.minSpeciesReturn + 10;
    this.maxSpeciesReturn = this.maxSpeciesReturn + 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

    slicedSpecies.forEach(eachObj => {
      this.getGoogleImages(eachObj, false);
    });

    this.content.scrollToTop(400);
  }

  previousPage(){
    this.minSpeciesReturn = this.minSpeciesReturn - 10;
    this.maxSpeciesReturn = this.maxSpeciesReturn - 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

    slicedSpecies.forEach(eachObj => {
      this.getGoogleImages(eachObj, false);
    });

    this.content.scrollToTop(400);
  }


  displayFirebase(searchQuery){
    console.log("### CHECKING OUR FIREBASE ###")

    var lowerQuery = searchQuery.toLowerCase();
    if(lowerQuery){
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
          console.log(this.ourFish);
        }else{
          console.log('no local species')
        }

        this.runFishbaseChecker(searchQuery);

      });
    }

  }

  displayFishbase(result, searchQuery){
    var loopValue = result['data']
    var arrayLength = 0;
    var speciesArray = [];

    loopValue.forEach(eachObj => {

      if(this.ourFish.length == 0){
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
    this.fbSpecies = clearOfDups;

    this.fbSpecies.forEach(relatedFish => {

      this.fbSpecies[arrayLength]['id'] = arrayLength;
      arrayLength++;

      if(this.fbSpecies.length <= 10){
        this.getGoogleImages(relatedFish, false);
      }else{
        console.log("TOO MANY SPECIES TO RUN GOOGLE IMAGES")
      }
    });

    console.log(this.fbSpecies)
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

          clearOfDups.forEach(subSpecies => {
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

            });

        }, error => {
          console.log("ALL MATCHES FAILED ON COMMON NAMES");
          this.relatedSpecies = [];
          this.doneLoading = true;
    });
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
          if(pushResults['Fresh'] == -1){
            this.relatedSpecies.push(pushResults);

            if(this.relatedSpecies.length <= 10){
              //console.log(pushResults);
              this.getGoogleImages(pushResults, true);
            }else{
              console.log("TOO MANY SPECIES TO RUN GOOGLE IMAGES")
            }
          }
        }else{
          if(pushResults['Fresh'] != -1){
            this.relatedSpecies.push(pushResults);

            if(this.relatedSpecies.length <= 10){
              //console.log(pushResults);
              this.getGoogleImages(pushResults, true);
            }else{
              console.log("TOO MANY SPECIES TO RUN GOOGLE IMAGES")
            }
          }
        }





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
      vulnerability: fish.Vulnerability,
      fresh: fish.Fresh
    })

    console.log("SPECIES ADDED TO SYSTEM")

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

    this.http.get('https://www.googleapis.com/customsearch/v1?q='+ fish['Genus'] + " " + fish['Species'] + '&searchType=image&num=10&imgSize=medium&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
      result => {
        this.fullImageCollection.push(result['items']);

        console.log(this.fullImageCollection);
        this.fullImageCollection.forEach(eachObj => {
          //console.log(eachObj);
          eachObj.forEach(eachObj2 => {
            this.googleImageArray.push(eachObj2['link']);
          });
        });

        //console.log(this.googleImageArray);
        this.addToDatabase(fish);

      }, error => {
        console.log(error)
    });
  }

  // GENERATE IMAGES FROM GOOGLE FOR CARDS
  getGoogleImages(eachObj, related){
      //var searchName = '';

      //console.log(eachObj)

      // if(eachObj['FBname']){
      //   searchName = eachObj['FBname'];
      // }else{

      // }


      // GOOGLE IMAGES SEARCH
      //console.log('### RUNNING GOOGLE IMAGE SEARCH FOR '+searchName+' ###')

      // console.log('retreiving images for...')
      // console.log(eachObj);

      this.http.get('https://www.googleapis.com/customsearch/v1?q='+ eachObj['Genus'] + " " + eachObj['Species'] +'&searchType=image&num=4&imgSize=medium&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
        result => {

          var images = [];
          var loopValue = result['items'];

          loopValue.forEach(eachObj => {
            //console.log(eachObj)
            if(eachObj['link'] && eachObj['displayLink'] != 'en.wikipedia.org' && eachObj['displayLink'] != 'www.shutterstock.com' && eachObj['displayLink'] != 'www.fishbase.us'){
              images.push(eachObj['link']);
            }
          });

          if(related){
            if(this.relatedSpecies.length == 1){
              this.relatedSpecies[0]['Pic'] = images;
            }else{
              if(this.relatedSpecies[this.rcounter]){
                this.relatedSpecies[this.rcounter]['Pic'] = images;
              }
            }

            this.rcounter = this.rcounter+1;
          }else{
            if(this.fbSpecies.length == 1){
              this.fbSpecies[0]['Pic'] = images;
            }else{
              if(this.fbSpecies[this.counter]){
                this.fbSpecies[this.counter]['Pic'] = images;
              }
            }
            this.counter = this.counter+1;
          }


        }, error => {
          console.warn(error)
      });
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
      this.showTankListLoader = true;
      this.showTankListTick = false;

      let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'] + '/species/' + this.toAddToTankSpecies['specCode']);

      tankAddress.set({
        dateSet: new Date(),
        name: this.toAddToTankSpecies['name'],
        specCode: this.toAddToTankSpecies['specCode']
      });

      console.log("Species added to tank!")

      setTimeout(()=>{
        this.showTankListLoader = false;
        this.showTankListTick = true;

        setTimeout(()=>{
          this.showSelectTank = false;
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

    }

    clearLetter(){
      this.letterCounter = [];
      this.selectedLetter = '';
    }
}
