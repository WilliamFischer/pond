import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { Location } from '@angular/common';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { PhotoViewer } from '@ionic-native/photo-viewer/ngx';

import { LoadingController } from '@ionic/angular';


@Component({
  selector: 'app-species',
  templateUrl: './species.page.html',
  styleUrls: ['./species.page.scss'],
})
export class SpeciesPage implements OnInit {

  debug: boolean = true;

  speciesSelected: boolean;
  speciesLoaded: boolean;
  fullWikiText: boolean;
  loggedIn: boolean;
  showSelectTank: boolean;
  toAddToTankSpecies: boolean;
  showTankListTick: boolean;
  showTankQuanityList: boolean;
  showTankListLoader: boolean;
  fabSelected: boolean;
  showNamesBox: boolean;
  newSpeciesName: boolean;
  hasReported: boolean;

  speciesVunFloored: number;
  currentQuantity: number;
  currentOrder: number;
  specimensOwend: number = 0;
  tempSpecimensOwend: number = 0;

  activeTankSelect: string;
  selectedTempTank: string;
  amountOfSpecies: string;
  altName: string;

  speciesImgArray: any = [];
  tanks: any = [];
  species: any = [];

  checkIfAlreadyInTankCollection: any;
  allTankCounterCollection: any;
  linkCollection: any;
  visualCollection: any;
  usercollection: any;
  wishlistCollection: any;
  tanksCollection: any;
  speciesCollection: any;
  altNames: any;


  constructor(
  public fireStore: AngularFirestore,
  public afAuth: AngularFireAuth,
  private location: Location,
  private router: Router,
  public loadingController: LoadingController,
  private photoViewer: PhotoViewer
  ) {}

  ngOnInit() {
    //this.backFromWishlist();
    this.speciesImgArray = [];
    this.species = [];
    this.speciesSelected = true;

    let fishSpecCode = window.location.pathname;
    let fishSpecCodeFinal = fishSpecCode.replace('/species/', '')

    if(this.debug){
      console.log(fishSpecCodeFinal);
    }

    this.visualCollection = this.fireStore.doc('Species/' + fishSpecCodeFinal).valueChanges().subscribe(
    species =>{
      console.log(species);
      this.species = species;

      if(!this.species){
        console.log('Can\'t yet populate species...')
      }else{
        if(species['vulnerability']){
          this.speciesVunFloored = Math.floor(species['vulnerability']);
        }

        if(species['species'] && species['genus']){
          this.lookForLinks(species);
        }

        // if(!species['Pics'][0] && !species['comments'] && !species['locality'] && !species['distribution']){
        //   console.log('Hmm, something is wrong with this species, we outta delete it');
        //   this.removeSpecies()
        // }else{
        //
        //   if(species['species'] && species['genus']){
        //     this.lookForLinks(species);
        //   }
        //
        // }

        this.speciesLoaded = true;

        setTimeout(()=>{
          console.log('Link Collecting timed out! This needs to be fixed!!')
          this.linkCollection.unsubscribe();
          this.allTankCounterCollection.unsubscribe();
          this.specimensOwend = this.tempSpecimensOwend;
        }, 3000);

        this.visualCollection.unsubscribe();
      }
    });

    this.afAuth.authState.subscribe(auth=>{
      if(auth){
        this.loggedIn = true;
        this.userHasSpecies();
        this.calculateStats();
      }else{
        this.loggedIn = false;
      }
    });

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

  async dismissLoading() {
    return await this.loadingController.dismiss();
  }

  goHome(){
    if(this.visualCollection){
      this.visualCollection.unsubscribe();
    }

    if(this.checkIfAlreadyInTankCollection){
      this.checkIfAlreadyInTankCollection.unsubscribe();
    }

    this.species = '';
    this.speciesLoaded = false;
    this.speciesSelected = false;

    if (window.history.length > 1) {
      console.log('Go Straight back')

      setTimeout(()=>{
        this.location.back();
      });

    } else {
      console.log('Go To Tabs')

      setTimeout(()=>{
        this.router.navigate(['/tabs'])
      });

    }

  }

  lookForLinks(species){
    console.log('### Looking for species links ###');

    //remove cat duplicates
    if(species['catPh'] == species['ph']){
      this.species['catPh'] = '';
    }

    if(species['catTemperature'] == species['temperature']){
      this.species['catTemperature'] = '';
    }

    if(species['catLocality'] == species['locality']){
      this.species['catLocality'] = '';
    }
    //end cat duplicates

    this.linkCollection = this.fireStore.collection('Species').valueChanges().subscribe(
    allFish =>{
      // 'All species are legal'
      for(var i in this.species['rules']){
        //console.log(this.species['rules'][i])
        if(this.species['rules'][i].includes(this.species['genus'] + ' spp.')){
          this.species['rules'][i] = 'You can legally own all species in the ' + this.species['rules'][i].replace('spp.', '') + ' genus.'
        }
      }

      for(var i in species){
        if(typeof species[species[i]] === 'string'){
          species[i] = this.urlify(species[i]);
        }

        let currentSpecies = species[i];

        if(this.species[i] && currentSpecies && currentSpecies.length >= 3 && typeof currentSpecies === 'string'){
          allFish.forEach(dbSpecies => {

            this.processLinkSpecies(null, i, dbSpecies, species);

          });
        }

        if(this.species[i] && currentSpecies && typeof currentSpecies === 'object'){
          for(var newI in currentSpecies){

            allFish.forEach(dbSpecies => {

              if(currentSpecies[newI].length >= 3){
                this.processLinkSpecies(newI, i, dbSpecies, species);
              }

            });

          }
        }

      }

    });
  }

  processLinkSpecies(newI, i, dbSpecies, species){


    let lowercaseSpecies;
    let speciesNickname;

    if(newI){
        lowercaseSpecies = this.species[i][newI].toLowerCase();
        this.species[i][newI] = this.species[i][newI].replace('spp.', 'species');
    }else{
        lowercaseSpecies = this.species[i].toLowerCase();
        this.species[i] = this.species[i].replace('spp.', 'species');
    }

    if((dbSpecies['species'] && dbSpecies['species'].length >= 3) && (dbSpecies['genus'] && dbSpecies['genus'].length >= 3)){
      let speciesSpecies = dbSpecies['species'].toLowerCase();
      let speciesGenus = dbSpecies['genus'].toLowerCase();
      let speciesName = dbSpecies['genus'].toLowerCase() + ' ' + dbSpecies['species'].toLowerCase();

      if(dbSpecies['name']){
         speciesNickname = dbSpecies['name'].toLowerCase();
      }else{
        speciesNickname = '';
      }

      if(lowercaseSpecies.includes(speciesName) &&  !lowercaseSpecies.includes(speciesName + "</a>")){

        let dbTrueName = species['genus'].toLowerCase() + ' ' + species['species'].toLowerCase();

        if(dbTrueName != speciesName){
          console.log('FOUND NAME ' + speciesName);
          let replaceURL = '<a href="tabs/species?search_query=' + speciesName + '"> ' + speciesName  +'</a>'

          let replace = speciesName;
          let re = new RegExp(replace,"g");

          if(newI){
            this.species[i][newI] = this.species[i][newI].replace(re, replaceURL)
          }else{
            this.species[i] = lowercaseSpecies.replace(re, replaceURL)
          }
        }
      }else{
        if(lowercaseSpecies.includes(speciesGenus.charAt(0) + '. ' +  dbSpecies['species']) || lowercaseSpecies.includes(' ' + speciesSpecies + ' ') || lowercaseSpecies.includes(' ' + speciesSpecies + ', ') || lowercaseSpecies.includes(' ' + speciesSpecies + 's ')){
          if(dbSpecies['species'].toLowerCase() != species['species'].toLowerCase() && (!species['name'] || !species['name'].toLowerCase().includes(speciesSpecies)) && (!species['wikiName'] || !species['wikiName'].toLowerCase().includes(speciesSpecies))){

            console.log('FOUND SPECIES ' + speciesSpecies);
            let replaceURL = '<a href="species/' + dbSpecies['specCode'] + '"> ' + dbSpecies['species']  +'</a>'

            let replace = ' ' + speciesSpecies;
            let re = new RegExp(replace,"g");

            if(newI){
              this.species[i][newI] = this.species[i][newI].replace(re, replaceURL)
            }else{
              this.species[i] = lowercaseSpecies.replace(re, replaceURL)
            }

          }
        }

        if(lowercaseSpecies.includes(' ' + speciesGenus + ' ') || lowercaseSpecies.includes(' ' + speciesGenus + ', ') || lowercaseSpecies.includes(' ' + speciesGenus + 's ')){
          if(dbSpecies['genus'].toLowerCase() != species['genus'].toLowerCase()){

            console.log('FOUND GENUS ' + speciesGenus);
            let replaceURL = '<a href="tabs/species?search_query=' + speciesGenus + '"> ' + dbSpecies['genus']  +'</a>'

            let replace = ' ' + speciesGenus;
            let re = new RegExp(replace,"g");

            if(newI){
              this.species[i][newI] = this.species[i][newI].replace(re, replaceURL)
            }else{
              this.species[i] = lowercaseSpecies.replace(re, replaceURL)
            }

          }
        }


        if(lowercaseSpecies.includes(' ' + speciesNickname + ' ') || lowercaseSpecies.includes(' ' + speciesNickname + ', ') || lowercaseSpecies.includes(' ' + speciesNickname + 's ')){
          let eachSpecies = species['name'].toLowerCase().split(' ');

          for (let i in eachSpecies){

              if((!species['name'].includes(eachSpecies[i]) &&  dbSpecies['name'].toLowerCase() != species['name'].toLowerCase()) && (!species['wikiName'] || !species['wikiName'].toLowerCase().includes(speciesNickname))){

                console.log('FOUND TRUE NAME ' + species['name']);

                let replaceURL = '<a href="species/' + dbSpecies['specCode'] + '"> ' + dbSpecies['name']  +'</a>'

                let replace = speciesNickname;
                let re = new RegExp(replace,"g");

                if(newI){
                  this.species[i][newI] = this.species[i][newI].replace(re, replaceURL)
                }else{
                  this.species[i] = lowercaseSpecies.replace(re, replaceURL)
                }

              }
          }

        }

      }

    }

  }

  urlify(text) {
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
  }

  addFishToWishlist(fish, e){
    e.stopPropagation()

    if(fish && fish['isFavourited']){
      console.log('Unfavouriting Fish...');

      fish['isFavourited'] = false;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + fish['specCode']);
      wishlistAddress.delete();


      this.species['favourites'] = this.species['favourites'] - 1;
    }else{
      console.log('Favouriting Fish...');

      fish['isFavourited'] = true;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + fish['specCode']);

      wishlistAddress.set({
        dateSet: new Date(),
        name: fish['name'],
        specCode: fish['specCode'],
        genus: fish['genus'],
        species: fish['species'],
        order: 0,
      },{
        merge: true
      });
    }


  }

  addTankTrigger(fish){
    this.showSelectTank = true;
    console.log('Showing tank select...')

    this.toAddToTankSpecies = fish;

    this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
    values =>{
      this.tanks = values;
      this.tanks.sort((a, b) => (a.order > b.order) ? 1 : -1)
    });
  }

  selectTank(tank){
    this.activeTankSelect = tank;

    setTimeout(()=>{
      this.doesFishExist(tank);
    });
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
    this.currentQuantity = 0;

    let exists = false;

    console.log(this.toAddToTankSpecies);

    this.checkIfAlreadyInTankCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'] + '/species').valueChanges().subscribe(values => {
      values.forEach(species => {
        if(species['specCode'] == this.toAddToTankSpecies['specCode']){
          this.currentQuantity = species['quantity'];
          this.currentOrder = species['order'];

          exists = true;
        }
      });

      if(exists){
        console.log('FISH ALREADY EXISTS');
        console.log(this.currentQuantity)
      }else{
        console.log('FISH IS NEW TO TANK ')
      }

      this.checkIfAlreadyInTankCollection.unsubscribe();

      this.showTankQuanityList = true;
      this.selectedTempTank = tank;

    });

  }

  setSpeciesTankQuantity(){
    this.showTankListLoader = true;

    let setList = {
      dateSet: new Date(),
      name: this.toAddToTankSpecies['name'],
      specCode: this.toAddToTankSpecies['specCode'],
      genus: this.toAddToTankSpecies['genus'],
      species: this.toAddToTankSpecies['species'],
      order: 0,
      quantity: 1
    };

    let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.selectedTempTank['name'].toLowerCase() + '/species/' + this.toAddToTankSpecies['specCode']);
    let scope = this;

    if (setList) {
      tankAddress.set(setList,{ merge: true }).then(function(ref) {
        console.log('Confirming Add, adjusting subchildren...');

        scope.checkIfAlreadyInTankCollection.unsubscribe();
        scope.addSpeciesFinal(tankAddress);
      }).catch(function(error) {
        console.log('Failed: ' + error);
      });
    }

    // tankAddress.set({
    //   dateSet: new Date(),
    //   name: this.toAddToTankSpecies['name'],
    //   specCode: this.toAddToTankSpecies['specCode'],
    //   genus: this.toAddToTankSpecies['genus'],
    //   order: 0,
    //   quantity: 1
    // },{
    //   merge: true
    // }).then(() => {
    // }).catch((err) => { alert(err) });

  }


  addSpeciesFinal(tankAddress){

    let quantity;

    if(this.currentQuantity){
      quantity = +this.amountOfSpecies + +this.currentQuantity
    }else{
      quantity = this.amountOfSpecies
    }

    tankAddress.set({
      quantity: quantity
    },{
      merge: true
    });

    setTimeout(()=>{
      this.showTankListLoader = false;
      this.showTankListTick = true;
      //console.log('Show Tick')
    }, 500);

    setTimeout(()=>{
      this.showTankListLoader = false;
      this.showTankListTick = false;
      //console.log('Hide Tick - Done')

      console.log("Species added to tank!")

      this.userHasSpecies();
      this.hidePopup();
    }, 1000);
  }

  hidePopup(){
    this.showTankListLoader = true;

    this.activeTankSelect = null;
    this.showTankQuanityList = false;
    this.showSelectTank = false;
    this.selectedTempTank = '';
    this.amountOfSpecies = '';
  }

  hideTankMenu(){
    this.showTankListLoader = false;
    this.showTankListTick = false;
    this.showTankQuanityList = false;
    this.showSelectTank = false;
    this.selectedTempTank = '';
  }


  seeFullImage(img){
    this.photoViewer.show(img);
  }

  showgenus(genus){
    console.log('navigate to search')
    this.router.navigateByUrl('tabs/search?search_query=' + genus.toLowerCase())

    this.presentLoading();

    setTimeout(()=>{
        this.dismissLoading();

      location.reload();
    }, 2000);

  }

  userHasSpecies(){
    let collectionone;
    let collectiontwo;
    let collectionthree;

    if(this.loggedIn){
      let speciesCount = 0;

      collectionone = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist').valueChanges().subscribe(values => {
        values.forEach(species => {
          if(species['specCode'] == this.species['specCode']){
            console.log('SPECIES IS IN WISHLIST!');
            this.species['isFavourited'] = true;
          }
        });
      });

      collectiontwo = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
      tanks =>{

        if(!tanks){
          console.log('Can\'t yet populate user tanks...')
        }else{
          tanks.forEach(tank => {
            this.allTankCounterCollection = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'].toLowerCase() + '/species').valueChanges().subscribe(
            species =>{
              //console.log(species)
              species.forEach(singleSpecies => {
                if(singleSpecies['specCode'] == this.species['specCode']){
                  speciesCount = +this.specimensOwend + +singleSpecies['quantity'];
                }
              });

              this.tempSpecimensOwend = speciesCount;

              collectionone.unsubscribe();
              collectiontwo.unsubscribe();
            });
          });

        }

      });

    }else{
      console.log('Nobody is logged in!')
    }


  }

  calculateStats(){
    console.log('### Calculate Stats ###')
    this.usercollection = this.fireStore.collection('Users').valueChanges().subscribe(values => {
      values.forEach(user => {


        if(user['uid']){
          this.wishlistCollection = this.fireStore.collection('Users/' + user['uid'] + '/wishlist').valueChanges().subscribe(values => {
            values.forEach(wishlist => {
              if(wishlist['name'] == this.species['name']){
                if(this.species['favourites']){
                  this.species['favourites'] = this.species['favourites'] + 1
                }else{
                  this.species['favourites'] = 1
                }
              }
            });
          });

          this.tanksCollection = this.fireStore.collection('Users/' + user['uid'] + '/tanks').valueChanges().subscribe(values => {
            values.forEach(tank => {
              this.speciesCollection = this.fireStore.collection('Users/' + user['uid'] + '/tanks/' + tank['trueName'].toLowerCase() + '/species').valueChanges().subscribe(values => {
                values.forEach(species => {
                  if(species['name'] == this.species['name']){
                    if(!this.species['owned']){
                      this.species['owned'] = 0;
                    }

                    this.species['owned'] = +this.species['owned'] + +species['quantity']
                  }
                });
              });
            });
          });

        }
      });
    });

    // setTimeout(()=>{
    //   console.log('Stat calulators out.')
    //   this.usercollection.unsubscribe();
    //   this.wishlistCollection.unsubscibe();
    //   this.tanksCollection.unsubscibe();
    //   this.speciesCollection.unsubscibe();
    // }, 3000);

  }

  removeSpecies(){

    let removeCollection = this.fireStore.doc('Species/' + this.species['specCode']);
    removeCollection.delete();

    alert('Oh, we had to delete this... Sorry, please readd it by searching for it again. ♡')
    this.router.navigateByUrl('tabs');

  }

  triggerNameSelect(){
    this.showSelectTank = true;
    this.showNamesBox = true;
  }


  setSpeciesName(){
    this.newSpeciesName = true;
  }


  confirmSpeciesName(){
    console.log(this.altName);

    if(this.altName){
      if(!this.species['altNames']){
        this.species['altNames'] = [];
      }

      this.species['altNames'].push({
        name: String(this.altName),
        user: this.afAuth.auth.currentUser.uid,
        id: this.species['altNames'].length
      });

      console.log(this.species['altNames']);

      let speciesAddress = this.fireStore.doc('Species/' + this.species['specCode']);
      speciesAddress.set({
        altNames: this.species['altNames']
      },{
        merge: true
      });

      this.newSpeciesName = false;
      this.altName = '';
    }

  }

  deleteItem(item){

    for(let i in this.species['altNames']){
      if(this.species['altNames'][i].id == item.id){
        this.species.altNames.splice(item.id, 1);
      }
    }

    console.log(this.species['altNames']);

    let speciesAddress = this.fireStore.doc('Species/' + this.species['specCode']);
    speciesAddress.set({
      altNames: this.species['altNames']
    },{
      merge: true
    });

    // console.log('Species/' + this.species['specCode'] + '/altNames/' + item.id);
    //
    // let speciesAddress = this.fireStore.doc('Species/' + this.species['specCode'] + '/altNames/' + item.id);
    // speciesAddress.delete();
  }

  reportItem(item){
    let speciesAddress = this.fireStore.doc('Reports/Names/' + item.name + '/' + item.id);
    speciesAddress.set(item);

    this.hasReported = true;
  }

  closeSpeciesNameSetter(){
    this.showSelectTank = false;
    this.showNamesBox = false;
    this.newSpeciesName = false;
    this.hasReported = false;
  }

  doneReported(){
    this.hasReported = false;
  }

  hideFab(){
    console.log('hiding fab...');
    this.fabSelected = false;


    var fabs = document.querySelectorAll('ion-fab');
    for (var i = 0; i < fabs.length; i++) {
      fabs[i].activated = false;
    }

  }

  toggleDimmer(){
    if(this.fabSelected){
      this.fabSelected = false;
    }else{
      this.fabSelected = true;
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

}
