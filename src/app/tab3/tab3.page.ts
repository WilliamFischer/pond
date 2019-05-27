import { Component, ViewChild } from '@angular/core';
import { IonContent, AlertController } from '@ionic/angular';

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
  searchQuery: string = '';
  species : any;
  fbSpecies: any = [];
  ourFish: any = [];
  relatedSpecies: any = [];
  tanks: any = [];
  toAddToTankSpecies: any;
  googleImageArray: any = [];
  counter: number = 0;
  minSpeciesReturn = 0;
  maxSpeciesReturn = 10;

  constructor(
    private http:HttpClient,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth){

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

    if(!this.speciesSelected){

      if(autoQuery.length >= 1){
        var searchQuery = autoQuery;
      }else{
        var searchQuery = $event.srcElement.value;
      }

      this.searchQuery = searchQuery;


      this.speciesSelected = false;

      this.fbSpecies = [];
      this.ourFish = [];
      this.relatedSpecies = [];

      if(searchQuery.length > 2){
        // console.log('Running API for ' + searchQuery + '...');

        this.displayFirebase(searchQuery);

        // this.checkFirebase(searchQuery);

      }else{
        console.log('Query length is too short.')
      }
    }


  }


  showGenus(genus){
    this.speciesSelected = false;
    this.checkAPI(false, genus);
    this.searchQuery = genus;
  }

  // Access detail page and save selected species
  selectSpecies(fish, inDB){
    console.clear();

    this.species = fish;
    console.log(fish)


    if(!inDB){
      this.fireStore.doc('Species/' + fish['SpecCode']).snapshotChanges().subscribe(
      values => {
        if(values.payload.exists){
          console.log('Fish Exists in DB');
          this.species = values
        }else{
          console.log("NEW TO SYSTEM... ADDING")

          this.getMoreGoogleImages(fish);
        }
      });

    }

    this.speciesSelected = true;

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
    this.speciesSelected = false;
  }

  nextPage(){
    this.minSpeciesReturn = this.minSpeciesReturn + 10;
    this.maxSpeciesReturn = this.maxSpeciesReturn + 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

    slicedSpecies.forEach(eachObj => {
      this.getGoogleImages(eachObj);
    });

    this.content.scrollToTop(400);
  }

  previousPage(){
    this.minSpeciesReturn = this.minSpeciesReturn - 10;
    this.maxSpeciesReturn = this.maxSpeciesReturn - 10;
    console.log("SHOWING RESULTS " + this.minSpeciesReturn + " TO " + this.maxSpeciesReturn);

    var slicedSpecies = this.fbSpecies.slice(this.minSpeciesReturn, this.maxSpeciesReturn);

    slicedSpecies.forEach(eachObj => {
      this.getGoogleImages(eachObj);
    });

    this.content.scrollToTop(400);
  }


  displayFirebase(searchQuery){
    console.log("### CHECKING OUR FIREBASE ###")

    var lowerQuery = searchQuery.toLowerCase();
    if(lowerQuery){
      this.fireStore.collection('Species').valueChanges().subscribe(
      values => {
        console.log("RETURNING SPECIES RESULT");

        values.forEach(eachObj => {
          if(lowerQuery ==  eachObj['name']){
            this.ourFish.push(eachObj);
          }
        });

        this.runFishbaseChecker(searchQuery);

      });
    }

  }

  displayFishbase(result, searchQuery){
    var loopValue = result['data']
    this.counter = 0;

    console.log(loopValue.length + ' SPECIES DETECTED ');
    console.log(loopValue);
    var arrayLength = 0;

    loopValue.forEach(eachObj => {

      if(this.fbSpecies.length <= 10){
        this.getGoogleImages(eachObj);
      }else if(this.fbSpecies.length <= 10){
        this.getGoogleImages(eachObj);
      }else{
        console.log("TOO MANY SPECIES TO RUN GOOGLE IMAGES")
      }

      if(eachObj['Fresh'] == -1 && eachObj['Saltwater'] == 0){
        this.fbSpecies.push(eachObj);
        this.fbSpecies[arrayLength]['id'] = arrayLength;

        arrayLength = arrayLength+1;
      }

    });

    this.checkCommNames(searchQuery);
  }


  // CHECK API AGAINST THE COMMON FISHBASE DATABASE
  checkCommNames(searchQuery){
    console.log("### CHECKING FISHBASE/COMMON NAMES ###")

    this.http.get('https://fishbase.ropensci.org/comnames?ComName=' + searchQuery + '&limit=500').subscribe(
        result => {
          // Handle result
          var loopableResults = result['data'];

          // console.log(loopableResults)

          loopableResults.forEach(eachObj => {
            this.fbSpecies.forEach(speciesObj => {

              if(speciesObj['SpecCode'] != eachObj['SpecCode']){
                // console.log('SPECIES ALLOWED')
                // console.log(eachObj)

                var theSpecCode = eachObj['SpecCode']
                this.http.get('https://fishbase.ropensci.org/species?SpecCode=' + theSpecCode + '&limit=500').subscribe(
                  result => {
                    var pushResults = result['data'][0];

                    // CHECK THAT SPECIES ISNT ALREADY LISTED
                    this.relatedSpecies.forEach(speciesObj => {

                      if(speciesObj['SpecCode'] != pushResults['SpecCode']){
                        if(pushResults['Fresh'] == -1 && pushResults['Saltwater'] == 0){
                          // console.log(pushResults)
                          this.relatedSpecies.push(pushResults);
                        }
                      }

                    });
                    this.doneLoading = true;
                });

              }else{
                // console.log('SPECIES DENIED')
                // console.log(eachObj)
              }
            });
          });

          console.log(this.relatedSpecies.length + ' NEW RELATED SPECIES DETECTED ');

          if(this.relatedSpecies.length > 1){
            console.log(this.relatedSpecies);
          }


        }, error => {
          console.log("ALL MATCHES FAILED ON COMMON NAMES");
          this.relatedSpecies = [];
          this.doneLoading = true;
    });
  }

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
      vulnerability: fish.Vulnerability
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



  }

  plantSearch(searchquery){

  }

  // GENERATE IMAGES FROM GOOGLE FOR INDIVIDUAL SPECIES
  getMoreGoogleImages(fish){
    console.log('### GENERATING 10 GOOGLE IMAGES ###');

    if(fish['genus']){
      var searchName = fish['genus'] + " " + fish['species'];
    }else{
      var searchName = fish['Genus'] + " " + fish['Species'];
    }


    this.http.get('https://www.googleapis.com/customsearch/v1?q='+ searchName +'&searchType=image&num=10&imgSize=medium&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
      result => {
        var loopValue = result['items'];

        loopValue.forEach(eachObj => {
          this.googleImageArray.push(eachObj['link']);
        });

        this.addToDatabase(fish);

      }, error => {
        console.log(error)
    });
  }

  // GENERATE IMAGES FROM GOOGLE FOR CARDS
  getGoogleImages(eachObj){
      var searchName;

      // GOOGLE IMAGES SEARCH
      console.log('### RUNNING GOOGLE IMAGE SEARCH ###')

      searchName = eachObj['Genus'] + " " + eachObj['Species'];

      this.http.get('https://www.googleapis.com/customsearch/v1?q='+ searchName +'&searchType=image&num=4&imgSize=medium&key=AIzaSyAOf-59bhKidnZ3xZBdS_0Pt77g3a6NllQ&cx=013483737079049266941:mzydshy4xwi').subscribe(
        result => {

          var images = [];
          var loopValue = result['items'];

          loopValue.forEach(eachObj => {
            images.push(eachObj['link']);
          });

          if(this.fbSpecies.length == 1){
            this.fbSpecies[0]['Pic'] = images;
          }else{
            if(this.fbSpecies[this.counter]){
              this.fbSpecies[this.counter]['Pic'] = images;
            }
          }

          this.counter = this.counter+1;

        }, error => {
          console.log(error)
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
}
