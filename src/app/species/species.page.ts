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

  speciesVunFloored: number;
  currentQuantity: number;
  currentOrder: number;
  specimensOwend: number = 0;

  activeTankSelect: string;
  selectedTempTank: string;
  amountOfSpecies: string;

  speciesImgArray: any;
  tanks: any = [];
  species: any;

  visualCollection: any;
  checkIfAlreadyInTankCollection: any;
  linkCollection: any;


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

        if(!species['comments'] && !species['locality'] && !species['distribution']){
          console.log('Hmm, something is wrong with this species, we outta delete it');
          this.removeSpecies()
        }else{

          if(species['species'] && species['genus']){
            this.lookForLinks(species);
          }

        }

        this.speciesLoaded = true;

        setTimeout(()=>{
          console.log('Link Collecting timed out!')
          this.linkCollection.unsubscribe();
        }, 3000);

        this.visualCollection.unsubscribe();
      }
    });

    this.afAuth.authState.subscribe(auth=>{
      if(auth){
        this.loggedIn = true;
        this.userHasSpecies();
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

    this.linkCollection = this.fireStore.collection('Species').valueChanges().subscribe(
    allFish =>{

      for(var i in species){
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
    let speciesFamily;

    if(newI){
        lowercaseSpecies = this.species[i][newI].toLowerCase();
    }else{
        lowercaseSpecies = this.species[i].toLowerCase();
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

      if(dbSpecies['family']){
        speciesFamily = dbSpecies['family'].toLowerCase();
      }else{
        speciesFamily = '';
      }

      if(lowercaseSpecies.includes(speciesGenus.charAt(0) + '. ' +  dbSpecies['species']) || lowercaseSpecies.includes(' ' + speciesSpecies + ' ') || lowercaseSpecies.includes(' ' + speciesSpecies + ', ') || lowercaseSpecies.includes(' ' + speciesSpecies + 's')){
        if(dbSpecies['species'].toLowerCase() != species['species'].toLowerCase()){

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

      if(lowercaseSpecies.includes(' ' + speciesGenus + ' ') || lowercaseSpecies.includes(' ' + speciesGenus + ', ') || lowercaseSpecies.includes(' ' + speciesGenus + 's')){
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

      if(lowercaseSpecies.includes(' ' + speciesNickname + ' ') || lowercaseSpecies.includes(' ' + speciesNickname + ', ') || lowercaseSpecies.includes(' ' + speciesNickname + 's')){
        if(dbSpecies['name'].toLowerCase() != species['name'].toLowerCase()){

          console.log('FOUND TRUE NAME ' + speciesNickname);

          let replaceURL = '<a href="tabs/species?search_query=' + speciesNickname + '"> ' + dbSpecies['name']  +'</a>'

          let replace = speciesNickname;
          let re = new RegExp(replace,"g");

          if(newI){
            this.species[i][newI] = this.species[i][newI].replace(re, replaceURL)
          }else{
            this.species[i] = lowercaseSpecies.replace(re, replaceURL)
          }

        }
      }

      if(dbSpecies['family'] && species['family']  && lowercaseSpecies.includes(speciesFamily)){
        if(dbSpecies['family'].toLowerCase() != species['family'].toLowerCase()){

          console.log('FOUND FAMILY ' + speciesFamily);

          let replaceURL = '<a href="species/' + dbSpecies['specCode'] + '"> ' + speciesFamily  +'</a>'

          let replace = speciesFamily;
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

  addFishToWishlist(fish){
    console.log('Favouriting Fish...')

    if(fish && fish['isFavourited']){
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
    }, 1000);
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
    this.router.navigateByUrl('tabs/species?search_query=' + genus.toLowerCase())

    this.presentLoading();

    setTimeout(()=>{
        this.dismissLoading();

      location.reload();
    }, 2000);

  }

  userHasSpecies(){
    let collection1;
    let collection2;

    if(this.loggedIn){
      this.specimensOwend = 0;

      collection1 = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
      tanks =>{

        if(!tanks){
          console.log('Can\'t yet populate user tanks...')
        }else{
          tanks.forEach(tank => {
            collection2 = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank['name'].toLowerCase() + '/species').valueChanges().subscribe(
            species =>{
              species.forEach(singleSpecies => {
                if(singleSpecies['specCode'] == this.species['specCode']){
                  this.specimensOwend++;
                }
              });

              setTimeout(()=>{
                collection1.unsubscribe();
                collection2.unsubscribe();
              }, 500);



            });
          });


        }

      });
    }else{
      console.log('Nobody is logged in!')
    }
  }

  removeSpecies(){

    let removeCollection = this.fireStore.doc('Species/' + this.species['specCode']);
    removeCollection.delete();

    alert('Oh, we had to delete this... Sorry, please readd it by searching for it again. ♡')
    this.router.navigateByUrl('tabs');

  }
}
