import { Component, ViewChild } from '@angular/core';
import { IonContent, ModalController, Platform, AlertController, IonReorderGroup, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';

import { finalize } from 'rxjs/operators';

import { SelectTankSubstratePage } from '../modal/select-tank-substrate/select-tank-substrate.page';


@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page {

  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  debug: boolean = true;

  defaultMode: boolean = true;
  addTankMode: boolean;
  tankDetailMode: boolean;
  addChemistryMode: boolean;
  reorderMode: boolean;
  doneLoadingTanks: boolean;
  loadingImageUpload: boolean;
  trashMode: boolean;
  fishLoaded: boolean;
  commenting: boolean;
  showLocalUpload: boolean;
  colourMode: boolean;
  canLoadTank: boolean;
  tankSizeImages: boolean;
  speciesSelected: boolean;
  speciesLoaded: boolean;
  fullWikiText: boolean;
  colourFound: boolean;
  userOnAndroid: boolean;
  wishlistMode: boolean;

  speciesVunFloored;
  tankChanges: any;
  tankDetailChanges: any;
  // phChanges: any;
  repeatArrayTank: any;
  userTankChanges: any;
  wishListChanges: any;
  wishListTrueSpeciesChanges: any;
  deleteCollection: any;
  deleteDividersCollection: any;
  dividerChanges: any;
  deleteAllSpecies: any;
  deleteAllDividers: any;
  colourCollection: any;
  colourDoc: any;
  tanks: any;
  wishlist: any;
  wishlistItems: any;
  fish_in_tank: any = [];
  dividers: any = [];
  user: any = [];
  colours: any = [];
  species: any = [];
  speciesImgArray: any = [];


  tank = {
    name: '',
    ph: 0,
    temp: 0,
    size: 0,
    substrate: '',
    average_ph: 0
  };

  // chemistry = {
  //   ph: 0.0,
  //   ammonia: 0.0,
  //   nitrite: 0.0,
  //   nitrate: 0.0
  // }

  totalQuanityOfFish: number = 0;
  QuanityOfFish: number = 0;
  tankFishQuantity: number = 0;

  activeTankData: object = null;
  lastChemistrySessionDate: Date = null;
  lastChemistrySession: object = null;


  constructor(
    public modalCtrl : ModalController,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private router: Router,
    public plt: Platform,
    public alertController: AlertController
  ) { }


    ngOnInit() {

      console.clear();
      console.log('POND v1.0.0 by William Fischer')

      //console.log(this.currentUser)

      //Populate user
      this.afAuth.authState.subscribe(auth=>{
        console.log(auth);

        if(this.afAuth.auth.currentUser.uid){
          this.userTankChanges = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid).valueChanges().subscribe(values =>{
            //console.log(values)

            if(values && values['uid']){
              this.populateUser(auth);
            }else{
              console.log('User dosen\'t exist in Firebase! Populating..')
              this.addUserToFirebase(auth);
            }
          });

        }else{
          console.log('Error logging user in');
          this.logout();
        }

      });

      if (this.plt.is('android')) {
        this.userOnAndroid = true;
      }else{
        this.userOnAndroid = false;
      }


    }

    ionViewDidEnter(){
      //console.log('WELCOME TO TAB 5');
      this.closeTank()
    }

    login(){
      this.router.navigateByUrl('/login');
    }

    ionViewDidLeave(){}

    populateUser(auth){
      // http://graph.facebook.com/{user_id}?fields=picture.height(961)

      this.user.name = auth.displayName;
      if(auth.providerData[0].providerId == 'google.com'){
        this.user.photoURL = auth.photoURL
      }else{
        this.user.photoURL = "https://graph.facebook.com/" + auth.providerData[0].uid + "/picture?height=500"
      }

      this.user.email = auth.email

      this.populateTanks();
      //console.log(this.afAuth.auth.currentUser.uid)



    }

    populateWishlist(){
      if(this.afAuth.auth.currentUser.uid){
        this.wishListChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist').valueChanges().subscribe(
        values =>{

          if(this.debug){
            console.log("Loading Wishlist ...");
          }

          this.wishlist = values;
        });
      }
    }

    triggerWishlist(){

      this.populateWishlist();

      this.wishListTrueSpeciesChanges = this.fireStore.collection('Species').valueChanges().subscribe(
      values =>{
        this.wishlistMode = true;
        let wishlistArray = [];

        this.wishlist.forEach(eachSpecies => {
          values.forEach(eachWishlistSpecies => {
            if(eachSpecies['specCode'] == eachWishlistSpecies['specCode']){
              wishlistArray.push(eachWishlistSpecies)
            }
          });
        });

        this.wishlistItems = wishlistArray
        console.log(this.wishlistItems);
        this.content.scrollToTop(400);
      });

    }

    backFromWishlist(){
      this.wishlistMode = false;
      this.wishlistItems = [];

      this.wishListChanges.unsubscribe();
      this.wishListTrueSpeciesChanges.unsubscribe();
    }

    removeFishFromWishlist(fish){
      fish['isFavourited'] = false;

      let wishlistAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/wishlist/' + fish['specCode']);
      wishlistAddress.delete();

      this.triggerWishlist();

    }

    populateTanks(){
      this.userTankChanges.unsubscribe();

      if(this.afAuth.auth.currentUser.uid){
        this.userTankChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
        values =>{

          if(this.debug){
            console.log("Loading Tanks ...");
          }


          this.totalQuanityOfFish = 0;
          this.tanks = values;

          if(this.repeatArrayTank){
            this.repeatArrayTank.unsubscribe();
          }

          if(!this.doneLoadingTanks){
            this.doneLoadingTanks = true;
          }

          // Find species count
          values.forEach(tankResult => {
            this.populateColours(tankResult);

            this.repeatArrayTank = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tankResult['name'] + '/species').valueChanges().subscribe(
            species =>{
              species.forEach(speciesSpecific => {
                //console.log(Number(speciesSpecific['quantity']));
                this.totalQuanityOfFish = this.totalQuanityOfFish + +Number(speciesSpecific['quantity']);

              });

            });
          });

          // THIS IS SEPERATLY POPULATING FISH COUNT :)

          setTimeout(()=>{
            let fishCount;

            if(this.totalQuanityOfFish){
              fishCount = this.totalQuanityOfFish
            }else{
              fishCount = 0
            }

            if(this.debug){
              console.log('User has ' + fishCount + ' fish')
            }

            this.repeatArrayTank.unsubscribe();

            this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid)
            .set({
              fishCount: fishCount
            },{
              merge: true
            });


          }, 2000);


          this.populateWishlist();
        });

        // setTimeout(()=>{
        //   this.QuanityOfFish = +this.totalQuanityOfFish + +Number(speciesSpecific['quantity']);
        //   this.totalQuanityOfFish = this.QuanityOfFish
        //   this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid)
        //   .set({
        //     fishCount: this.totalQuanityOfFish
        //   },{
        //     merge: true
        //   });
        // }, 1000);
        //
      }else{
        console.log('Gotta log in');
        // this.logout();
      }
    }

    populateColours(tankResult){
      let currentNum = tankResult['colourNumber']

      this.colourCollection = this.fireStore.collection('Colours').valueChanges().subscribe(
      values =>{
        this.colours = values;

        let currentColour = values[currentNum];

        if(currentColour['third']){
          tankResult.fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ', ' + currentColour['third'] + ')';
        }else{
          tankResult.fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ')';
        }

        this.colourFound = true;
        this.colourCollection.unsubscribe();
      });
    }

    addUserToFirebase(auth){

      let name = auth.displayName;
      let email = auth.email;

      let pic;
      if(auth.providerData[0].providerId == 'google.com'){
        pic = auth.photoURL
      }else{
        pic = "https://graph.facebook.com/" + auth.providerData[0].uid + "/picture?height=500"
      }

      this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid)
      .set({
        name: name,
        email: email,
        pic: pic,
        uid: this.afAuth.auth.currentUser.uid
      },{
        merge: true
      });

      console.log('User Added!')
      this.populateUser(auth);
    }

    doReorder(ev: any) {
      console.log('Before complete fish:', this.fish_in_tank);

      let scope = this;

      //console.log(this.fish_in_tank[ev.detail['to']])

      this.fish_in_tank = ev.detail.complete(this.fish_in_tank);

      setTimeout(()=>{

        this.fish_in_tank.forEach(function(value, key) {
          if(value['type'] == 'divider'){
            //console.log('Setting ' + key + " to divider " + value['id'])
            //console.log('setting to ' + 'Users/' + scope.currentUser + '/tanks/' + scope.activeTankData['name'] + '/dividers/' + value['name']);
            scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + scope.activeTankData['name'] + '/dividers/' + value['id'])
            .set({
              order: key
            },{
              merge: true
            });
          }

          if(value['type'] == 'fish'){
            //console.log('Setting ' + key + " to fish " + value['genus'])
            //console.log('setting to ' + 'Users/' + scope.currentUser + '/tanks/' + scope.activeTankData['name'] + '/species/' + value['spec_code']);
            scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + scope.activeTankData['name'] + '/species/' + value['spec_code'])
            .set({
              order: key
            },{
              merge: true
            });
          }
        });

        console.log('After complete fish:', this.fish_in_tank);

      }, 1000);


      // if(this.dividers.length > 1){
      //   console.log('Before complete dividers:', this.dividers);
      //   this.dividers = ev.detail.complete(this.dividers);
      //   console.log('After complete dividers: ', this.dividers);
      // }
    }

    triggerTrash(){
      this.trashMode = true;
    }

    unTriggerTrash(){
      this.trashMode = false;
      this.reorderMode = false;
      this.commenting = false;
    }

    getFish() {
      if(this.debug)
      console.log(this.activeTankData['name'])

      this.tankChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/species').valueChanges().subscribe(values => {
        //console.log(this.fish_in_tank);

        if(this.debug)
        console.log('Populating species...')

        values.forEach(fish => {
            //console.log(fish)

            let comm_name;
            let comment;
            let nickname;

            if(fish['specCode'] && fish['name']){
              comm_name = fish['name'];
            }else if(fish['specCode'] && !fish['name']){
              comm_name = fish['genus'];
            }else{
              comm_name = ''
            }

            if(fish['comment']){
              comment = fish['comment'];
            }else{
              comment = ''
            }

            if(fish['nickname']){
              nickname = fish['nickname'];
            }else{
              nickname = ''
            }


            let quantity = fish['quantity'];
            let specCode = fish['specCode'];
            let genus = fish['genus'];
            let order = fish['order'];

            let fishObj = {
              'comm_name': comm_name,
              'genus': genus,
              'spec_code': specCode,
              'quantity': quantity,
              'nickname': nickname,
              'type': 'fish',
              'order': order,
              'comment': comment
            }

            this.tankFishQuantity = +this.tankFishQuantity + +quantity;

            if(comm_name){
              this.fish_in_tank.push(fishObj);
            }

        });

        setTimeout(()=>{
          if(this.tankChanges){
            if(this.debug)
            console.log('done populating species')

            this.tankChanges.unsubscribe();
          }
        }, 1000);

      });
      // }, () => {
      //
      // }).then(function() {
      //   console.log('done populating species')
      //   this.tankChanges.unsubscribe();
      //   console.log(this.fish_in_tank);
      // });

      // var scope = this;
      // var _fishlist = [];
      // var tank_fish = this.fireStore.collection('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'] + '/species');
      // tank_fish.get().forEach(data => {
      //   var _data = data.docs;
      //   _data.forEach(record => {
      //     var fishData = record.data();
      //     console.log(fishData);
      //     _fishlist.push(fishData);
      //   });
      //   return;
      // }).then(function() {
      //   console.log(_fishlist);
      //   var _allfish = [];
      //
      // });
    }

    // openNewChemistrySession() {
    //   this.tankDetailMode = false;
    //   this.defaultMode = false;
    //   this.addTankMode = false;
    //   this.addChemistryMode = true;
    // }

    // Submit tank to database
    // confirmChemistryForm(){
    //   this.addChemistryMode = false;
    //   this.tankDetailMode = true;
    //
    //   console.log("success");
    //
    //   let id = this.fireStore.createId();
    //
    //   let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/chemistry/' + id);
    //
    //   tankAddress.set({
    //     date: new Date(),
    //     ph: this.chemistry.ph,
    //     ammonia: this.chemistry.ammonia,
    //     nitrite: this.chemistry.nitrite,
    //     nitrate: this.chemistry.nitrate
    //   });
    //
    //   alert('New Chemistry Session Added')
    // }

    // calculateAveragePH() {
    //   var scope = this;
    //   this.phChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/chemistry')
    //   .valueChanges().forEach(data => {
    //     let _total = 0;
    //
    //     for(var i = 0; i < data.length; i++){
    //       let ph = data[i]["ph"];
    //       _total += +ph;
    //     }
    //
    //     let avg_ph = _total / data.length;
    //     scope.activeTankData["average_ph"] = avg_ph;
    //     console.log("ASYNC: Average tank pH update");
    //   });
    // }

    // initChemistry() {
    //   if(this.activeTankData) {
    //     this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/chemistry')
    //     .ref.orderBy("date", "desc").limit(1)
    //     .get().then(data => {
    //       if(data.docs.length > 0){
    //         this.lastChemistrySession = data.docs[0].data();
    //         let secs = +this.lastChemistrySession["date"]["seconds"];
    //         console.log(secs);
    //         this.lastChemistrySessionDate = new Date(secs * 1000);
    //         console.log(this.lastChemistrySessionDate);
    //       } else {
    //         this.lastChemistrySession = null;
    //         console.log("No chemistry sessions located");
    //         return;
    //       }
    //     })
    //   }
    // }

    initTankDetail(tankname){

      if (this.plt.is('ios') || this.plt.is('android')) {
        this.showLocalUpload = false;
      }{
        this.showLocalUpload = true;
      }

      this.tankDetailMode = true;
      this.tankDetailChanges = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tankname)
      .valueChanges().subscribe(data => {
        if(data){
          // console.log(data);
          this.activeTankData = data;

          if(this.debug){
            console.log("ASYNC: Refreshing active tank object");
            console.log(this.activeTankData);
          }


          this.tankDetailMode = true;
          this.defaultMode = false;
          this.addTankMode = false;
          this.addChemistryMode = false;
          this.wishlistMode = false;

          // this.initChemistry();
          // this.calculateAveragePH();

          this.content.scrollToTop(400);

        } else {
          console.log("Cannot find tank data");
        }
      });

      setTimeout(()=>{
        this.getFish();
        this.getDividers();
      }, 500);
    }

    getDividers(){
      if(this.debug){
        console.log('Grabbing dividers..');
      }

      this.dividerChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/dividers').valueChanges().subscribe(values => {
        //console.log(this.fish_in_tank);
        if(this.debug)
        console.log('Populating dividers...')

        values.forEach(divider => {

            let name = divider['name'];
            let order = divider['order'];
            let id = divider['id'];

            let divderObj = {
              'name': name,
              'order': order,
              'id': id,
              'type': 'divider'
            }

            this.fish_in_tank.push(divderObj);
        });

        setTimeout(()=>{
          if(this.dividerChanges){

            if(this.debug)
            console.log('done populating dividers')

            this.dividerChanges.unsubscribe();
            this.fish_in_tank.sort((a, b) => (a.order > b.order) ? 1 : -1)

            if(this.debug)
            console.log(this.fish_in_tank);

            this.fishLoaded = true;
          }
        }, 500);

      });
    }

    addDivider(){
      this.presentAlertPrompt();
    }

    async presentAlertPrompt() {
    const alert = await this.alertController.create({
      header: 'Add a new divider',
      inputs: [
        {
          name: 'divider_name',
          type: 'text',
          placeholder: 'Divider Name...'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            this.fishLoaded = false;

            let count = Math.floor(Math.random() * 1000);

            let dividerName = data.divider_name
            let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/dividers/' + count);

            tankAddress.set({
              dateSet: new Date(),
              name: dividerName,
              order: 0,
              id: count
            },{
              merge: true
            });

            console.log("Divider added to tank!")

            this.restartTank();
            //this.closeTank();
          }
        }
      ]
    });

    await alert.present();
  }


    // Switch to newTank mode
    addTank(){
      this.addTankMode = true;
      this.defaultMode = false;
      this.tankDetailMode = false;
      this.addChemistryMode = false;
    }

    deleteFishFromTank(fish){
      this.fishLoaded = false;

      this.tankFishQuantity = 0;

      let fishAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"] + "/species/" + fish['spec_code']);
      let scope = this;
      //this.fish_in_tank = [];

      fishAddress.delete()
      .then(function() {
        scope.restartTank();

        //scope.getDividers();

        // scope.deleteCollection = scope.fireStore.collection('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + scope.activeTankData["name"] + "/species").valueChanges().subscribe(
        // values =>{
        //   console.log(values);
        //
        //   values.forEach(fish => {
        //       let comm_name;
        //       let comment;
        //
        //       if(fish['species'] && !fish['name']){
        //        comm_name = fish['species'] + fish['genus'];
        //       }else if(fish['species'] && fish['name']){
        //         comm_name = fish['name'];
        //       }
        //
        //       let quantity = fish['quantity'];
        //       let specCode = fish['specCode'];
        //       let genus = fish['genus'];
        //       let order = fish['order'];
        //
        //       if(fish['comment']){
        //         comment = fish['comment'];
        //       }else{
        //         comment = ''
        //       }
        //
        //       let fishObj = {
        //         'comm_name': comm_name,
        //         'genus': genus,
        //         'spec_code': specCode,
        //         'quantity': quantity,
        //         'type': 'fish',
        //         'order': order,
        //         'comment': comment
        //       }
        //
        //       scope.tankFishQuantity = +scope.tankFishQuantity + +quantity;
        //
        //       if(fishObj['comm_name'])
        //       scope.fish_in_tank.push(fishObj);
        //     });




        // setTimeout(()=>{
        //   if(scope.deleteCollection){
        //     console.log('done deleting species')
        //     scope.deleteCollection.unsubscribe();
        //   }
        // }, 1000);

      });


    }

    restartTank(){
      console.log('restarting tank..')
      this.fish_in_tank = [];
      this.dividers = [];
      this.tankFishQuantity = 0;

      this.setReorders();

      setTimeout(()=>{
        if(this.debug)
        console.log('### REGETTING FISH SPECIES ###')

        this.getFish();
        this.getDividers();

        if(this.debug)
        console.log('### RESORTING SPECIES ###')

        this.fish_in_tank.sort((a, b) => (a.order > b.order) ? 1 : -1)

        if(this.debug)
        console.log(this.fish_in_tank);


        setTimeout(()=>{
          this.fishLoaded = true;
        }, 500);

      }, 1000);


    }

    commentMode(){
      this.commenting = true;
    }

    addFishComment(fish){
      if(this.debug)
      console.log(fish)

      this.commentAlertPrompt(fish);
    }

    editCommentFromFish(fish){
      this.commentAlertPrompt(fish);
    }

    editFishNickname(fish){
      this.fishNicknameAlertPrompt(fish);
    }

    editDivider(fish){
      this.dividerAlertPrompt(fish);
    }

    deleteCommentFromFish(fish){
      fish['comment'] = '';

      let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/species/' + fish['spec_code']);

      commentAddress.set({
        comment: ''
      },{
        merge: true
      });

      if(this.debug)
      console.log("Comment removed from species!");
    }




    async commentAlertPrompt(fish) {
      let placeholderValue;
      if(fish['comment']){
        placeholderValue = fish['comment']
      }else{
        placeholderValue = ''
      }

    const alert = await this.alertController.create({
      header: fish['comm_name'] + ' comments'.charAt(0).toUpperCase(),
      inputs: [
        {
          name: 'comment',
          type: 'text',
          placeholder: 'Species comments...',
          value: placeholderValue
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if(this.debug)
            console.log('User Cancelled');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            fish['comment'] = data.comment;

            let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/species/' + fish['spec_code']);

            commentAddress.set({
              comment: data.comment
            },{
              merge: true
            });

            if(this.debug)
            console.log("Comment added to species!");
          }
        }
      ]
    });

    await alert.present();
  }


    deleteDivider(divider){
      this.fishLoaded = false;
      console.log('deleteing divider...')
      let dividerAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"] + "/dividers/" + divider['id']);
      let scope = this;
      this.fish_in_tank = []

      dividerAddress.delete()
      .then(function() {
        scope.restartTank();
      });

    }


    async dividerAlertPrompt(fish) {
      //console.log(fish)
      let placeholderValue;
      if(fish['name']){
        placeholderValue = fish['name']
      }else{
        placeholderValue = ''
      }

    const alert = await this.alertController.create({
      header: 'Rename Divider',
      inputs: [
        {
          name: 'dividerName',
          type: 'text',
          placeholder: 'Divider Name...',
          value: placeholderValue
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if(this.debug)
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            fish['name'] = data.dividerName;

            let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/dividers/' + fish['id']);

            commentAddress.set({
              name: data.dividerName
            },{
              merge: true
            });

            if(this.debug)
            console.log("Divider updated!");
          }
        }
      ]
    });

    await alert.present();
  }

  async adjustQuantity(fish) {
    //console.log(fish)
    let placeholderValue;
    if(fish['quantity']){
      placeholderValue = fish['quantity']
    }else{
      placeholderValue = ''
    }

  const alert = await this.alertController.create({
    header: 'Change Quantity',
    inputs: [
      {
        name: 'fishQuan',
        type: 'tel',
        placeholder: 'Fish Quantity...',
        value: placeholderValue
      }
    ],
    buttons: [
      {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: () => {
          if(this.debug)
          console.log('Confirm Cancel');
        }
      }, {
        text: 'Ok',
        handler: (data) => {
          fish['quantity'] = data.fishQuan;

          let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/species/' + fish['spec_code']);

          commentAddress.set({
            quantity: data.fishQuan
          },{
            merge: true
          });

          console.log("Fish quantity updated to " + data.fishQuan + "!");
        }
      }
    ]
  });

  await alert.present();
}

  async fishNicknameAlertPrompt(fish) {
      console.log(fish);

      let placeholderValue;
      if(fish['nickname']){
        placeholderValue = fish['nickname']
      }else{
        placeholderValue = ''
      }

    const alert = await this.alertController.create({
      header: fish['comm_name'] + "\'s Nickname",
      inputs: [
        {
          name: 'fishNickname',
          type: 'text',
          placeholder: 'Fish Nickname...',
          value: placeholderValue
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {if(this.debug)
            if(this.debug)
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          handler: (data) => {
            fish['nickname'] = data.fishNickname;

            let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/species/' + fish['spec_code']);

            commentAddress.set({
              nickname: data.fishNickname
            },{
              merge: true
            });

            if(this.debug)
            console.log("Fish nickname set!");
          }
        }
      ]
    });

    await alert.present();
  }


    // Update tank temperature
    updateTankTemp(value) {
      if(value > 0) {
        this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'])
        .set({
          temp: value
        },{
          merge: true
        });
        this.populateTanks();
      } else {
        if(this.debug)
        console.log("tank temp cannot be 0 or null ! Try again dweeb :)");
      }
    }

    // Update tank size
    updateTankSize(value) {
      if(value > 0) {
        this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'])
        .set({
          size: value
        },{
          merge: true
        });
        this.populateTanks();
      } else {
        if(this.debug)
        console.log("tank size cannot be 0 or null ! Try again dweeb :)");
      }
    }

    // Save substrate data
    updateTankSubstrate(value) {
      if(value) {
        this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'])
        .set({
          substrate: value
        },{
          merge: true
        });
        this.populateTanks();
      } else {
        if(this.debug)
        console.log("tank substrate cannot be 0 or null ! Try again dweeb :)");
      }
    }

    // Show fish detail modal
   //  async openFishDetailModal(fish, tankData) {
   //   if(this.debug)
   //   console.log("creating fish detail modal");
   //
   //   const modal = await this.modalCtrl.create({
   //     component: FishDetailPage,
   //     componentProps: { fish: fish, tank: tankData }
   //   });
   //
   //   modal.onDidDismiss().then(modalData => {
   //     // this.updateCallType(modalData.data);
   //     if(this.debug){
   //      console.log("Fish edit finished");
   //      console.log(modalData.data);
   //     }
   //
   //     // Make sure you pass the value object
   //     // this.updateTankSubstrate(modalData.data["value"]);
   //   })
   //
   //   return await modal.present();
   // }
   //
   //

   unSelectSpecies(){
     console.clear();
     this.speciesSelected = false;
   }

   openFishDetailModal(fish){
     let fishSpecCode;

     if(fish["spec_code"]){
       fishSpecCode = fish["spec_code"];
     }else{
       fishSpecCode = fish['specCode']
     }

      this.router.navigateByUrl('/species/' + fishSpecCode);
   }

    // Show susbstrate edit modal
    async presentSubstrateEditModal() {
     console.log("creating call type selector");
     const modal = await this.modalCtrl.create({
       component: SelectTankSubstratePage
       // componentProps: { default: user }
     });

     modal.onDidDismiss().then(modalData => {
       // this.updateCallType(modalData.data);
       console.log("Substrate edit finished");
       console.log(modalData.data);
       // Make sure you pass the value object
       this.updateTankSubstrate(modalData.data["value"]);
     })

     return await modal.present();
   }

   // Remove tank from database
   deleteTank() {
     this.confirmTankDelete();
   }

   async confirmTankDelete() {
     const confirmDelete = await this.alertController.create({
        header: 'Are you sure you want to delete this tank?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              console.log('Confirm Cancel');
            }
          }, {
            text: 'Delete',
            handler: () => {
              let scope = this;
              let tankAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"]);

              this.deleteAllSpecies = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"] + '/species').valueChanges().subscribe(
              species =>{
                species.forEach(result => {
                  console.log(result)
                  let resultAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"] + '/species/' + result['specCode']);
                  resultAddress.delete();
                });
              });

              this.deleteAllDividers = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"] + '/dividers').valueChanges().subscribe(
              species =>{
                species.forEach(result => {
                  console.log(result)
                  let resultAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"] + '/dividers/' + result['id']);
                  resultAddress.delete();
                });
              });

              tankAddress.delete()
              .then(function() {
                scope.deleteAllSpecies.unsubscribe();
                scope.deleteAllDividers.unsubscribe();
                scope.defaultMode = true;
                scope.addTankMode = false;
                scope.wishlistMode = false;
                scope.tankDetailMode = false;
                scope.addChemistryMode = false;
                scope.activeTankData = null;
                scope.populateTanks();
              });
            }

            }
        ]
      });

      await confirmDelete.present();
    }


   renameTank(){
    this.renameTankPrompt();
   }

   async renameTankPrompt() {
     let tankName;

     if(this.activeTankData['nickname']){
       tankName = this.activeTankData['nickname'];
     }else if(this.activeTankData['name']){
       tankName = this.activeTankData['name']
     }else{
       tankName = ''
     }

     const alert = await this.alertController.create({
       header: 'Rename this tank',
       inputs: [
         {
           name: 'tankName',
           type: 'text',
           placeholder: 'Tank Name...',
           value: tankName
         }
       ],
       buttons: [
         {
           text: 'Cancel',
           role: 'cancel',
           cssClass: 'secondary',
           handler: () => {
             console.log('Confirm Cancel');
           }
         }, {
           text: 'Ok',
           handler: (data) => {

             let newTankName = data.tankName
             let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name']);
             console.log('setting to ' + ('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name']))

             tankAddress.set({
               nickname: String(newTankName)
             },{
               merge: true
             });

             this.activeTankData['name'] = String(newTankName);

             console.log("Tank name changed to " + String(newTankName))
             this.populateTanks();
             //
             // this.restartTank();
             //this.closeTank();
           }
         }
       ]
     });

     await alert.present();
   }

   closeTank() {
     this.defaultMode = true;
     this.addTankMode = false;
     this.wishlistMode = false;
     this.tankDetailMode = false;
     this.addChemistryMode = false;
     this.fishLoaded = false;
     this.activeTankData = null;
     this.fish_in_tank = [];
     this.dividers = [];
     this.tankFishQuantity = 0;

     this.setReorders();
   }

   setReorders(){
     // let scope = this;
     //
     // this.fish_in_tank.forEach(function(value, key) {
     //   scope.fireStore.doc('Users/' + scope.currentUser + '/tanks/' + scope.activeTankData['name'] + '/species/' + value['spec_code'])
     //   .set({
     //     order: key
     //   },{
     //     merge: true
     //   });
     // })
   }

   closeChemistrySession() {
     this.defaultMode = false;
     this.addTankMode = false;
     this.tankDetailMode = true;
     this.addChemistryMode = false;
   }

   closeAddTank() {
     this.defaultMode = true;
     this.addTankMode = false;
     this.tankDetailMode = true;
     this.addChemistryMode = false;
   }

  // Submit tank to database
  confirmForm(){
    this.addTankMode = false;
    this.defaultMode = true;
    console.log(this.tank);

    let tankAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.tank.name);

    console.log('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.tank.name);

    tankAddress.set({
      name: this.tank.name,
      trueName: this.tank.name,
      ph: this.tank.ph,
      temp: this.tank.temp,
      size: this.tank.size,
      substrate: this.tank.substrate,
      colourNumber: 1
    },{
      merge: true
    });

  }

  openSpeciesSearch() {
    this.router.navigateByUrl('/tabs/species');
  }


  uploadTankImg(event) {
    this.loadingImageUpload = true;

    const file = event.target.files[0];
    let randomID = Math.floor(Math.random() * 1000);
    const filePath = this.afAuth.auth.currentUser.uid + '/Tank Images/' + randomID;
    const fileRef = this.storage.ref(filePath)
    const task = this.storage.upload(filePath, file);

    task.snapshotChanges().pipe(
        finalize(() => {
          const downloadURL = fileRef.getDownloadURL();

          downloadURL.subscribe(url=>{
             if(url){
               this.loadingImageUpload = false;
               console.log(url);
               this.activeTankData['photoURL'] = url;

                this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'])
                .set({
                  photoURL: url
                },{
                  merge: true
                });
             }
          })

        })
     )
    .subscribe()
  }

  triggerReorder(){
    this.reorderMode = true;
  }

  // Route the user back to the login page
  logout(){
    console.log('Logging out...')

    this.afAuth.auth.signOut().then(() => {
       //this.router.navigateByUrl('/login');
       location.reload();
    });
  }

  changeColour(tank, index){
    this.canLoadTank = true;
    this.colourFound = false;
    this.userTankChanges.unsubscribe();

    let amountOfColours = 15;

    if(tank["name"] && this.canLoadTank){
      this.colourDoc = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank["name"]).valueChanges().subscribe(
      tank =>{
        //console.log(tank['colourNumber'])

        let counterNumber;

        if(tank['colourNumber']){
          if(tank['colourNumber'] == amountOfColours){
            counterNumber = 0;
          }else{
            counterNumber = tank['colourNumber'] + +1;
          }
        }else{
          counterNumber = 1;
        }

        let currentColour = this.colours[counterNumber];

        if(currentColour['third']){
          this.tanks[index].fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ', ' + currentColour['third'] + ')';
        }else{
          this.tanks[index].fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ')';
        }

        if(tank["name"]){
          this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank["name"])
          .set({
            colourNumber: counterNumber
          },{
            merge: true
          })

          this.canLoadTank = false;
          this.colourFound = true;
          this.colourDoc.unsubscribe();
        }

      });
    }else{
      console.log('couldnt locate tank')
    }


  }

  showTankSizesImage(){
    this.tankSizeImages = true;

    this.content.scrollToTop(400);
  }

  closeTankSizeTrigger(){
    this.tankSizeImages = false;
  }

}
