import { Component, ViewChild } from '@angular/core';
import { IonContent, ModalController, Platform, AlertController, IonReorderGroup, LoadingController, ActionSheetController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';

import { finalize } from 'rxjs/operators';

@Component({
  selector: 'myTanks',
  templateUrl: 'myTanks.page.html',
  styleUrls: ['myTanks.page.scss']
})
export class myTanksPage {

  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  debug: boolean = false;

  defaultMode: boolean = true;
  fullAccountMode: boolean = true;
  showWishlist: boolean = true;
  showTanks: boolean = true;

  addTankMode: boolean;
  tankDetailMode: boolean;
  addChemistryMode: boolean;
  reorderMode: boolean;
  doneLoadingTanks: boolean;
  trashMode: boolean;
  fishLoaded: boolean;
  commenting: boolean;
  showLocalUpload: boolean;
  colourMode: boolean;
  canLoadTank: boolean;
  tankSizeImages: boolean;
  speciesSelected: boolean;manu
  speciesLoaded: boolean;
  fullWikiText: boolean;
  colourFound: boolean;
  userOnAndroid: boolean;
  wishlistMode: boolean;
  dynamicUgh: boolean;
  showHead: boolean;
  groupingMode: boolean;

  accountScreenVal: string;
  accountScreenValBack: string;
  accountScreenValMinHeightBack: string;
  currentGroup: string;
  tankSearchController: string = '';
  reverseScroll: number = 445;
  reverseTop: number = 0;

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
  tanksHold: any;
  wishlist: any;
  wishlistItems: any;
  checkCollection: any;
  fish_in_tank: any = [];
  dividers: any = [];
  user: any = [];
  colours: any = [];
  species: any = [];
  groupedTanks: any = [];
  speciesImgArray: any = [];

  tank = {
    name: '',
    ph: 0,
    temp: 0,
    size: 0,
    isSaltwater: false,
    isBrackish: false,
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
  totalQuanityOfFollows: number = 0;
  totalQuanityOfFollowers: number = 0;
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
    public loadingController: LoadingController,
    public alertController: AlertController,
    public actionSheetController: ActionSheetController
  ) { }

    ngOnInit() {
      //console.log(this.currentUser)

      if(localStorage.getItem('showWishlist') && String(localStorage.getItem('showWishlist')).includes('false')){
        this.showWishlist = false;
      }

      //Populate user
      this.afAuth.authState.subscribe(auth=>{
        
        if(this.debug){
          console.log(auth); 
        }

        if(auth){
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
          console.log('User not logged in');
          //this.logout();
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

    triggerHead(){
      this.showHead = !this.showHead;
    }

    triggerAutoComplete(query){
      console.log('Search tanks for ' + query);

      if(query.length !== 0){
        let filterdTanks = [];
        for (let i = 0; i < this.tanksHold.length; i++) {
          if (this.tanksHold[i].trueName.toLowerCase().includes(query)) {
            filterdTanks.push(this.tanksHold[i]);
          }
        }

        this.tanks = filterdTanks;
      }else{
        this.clearSearch();
      }

    }

    clearSearch(){
      this.tankSearchController = '';
      console.log(this.tanksHold)
      this.tanks = this.tanksHold;
    }

    reOrderTanks(ev, group){
      ev.stopPropagation();

      // console.log(ev);
      //
      // console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);
      //
      // ev.detail.complete();

      console.log('Before complete tanks:', group);

      let scope = this;

      //console.log(this.fish_in_tank[ev.detail['to']])

      group = ev.detail.complete(group);
      this.tanksHold = group;

      setTimeout(()=>{

        group.forEach(function(value, key) {
          console.log(key);

          if(value['trueName']){
            scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + value['trueName'].toLowerCase())
            .set({
              order: key
            },{
              merge: true
            });
          }
        });

        console.log('After complete tanks:', group);

      }, 1000);
    }

    reOrderGroups(ev){
      ev.stopPropagation();

      console.log('Before complete tanks:', this.tanks);

      console.log('Dragged from index', ev.detail.from, 'to', ev.detail.to);

      this.tanks[ev.detail.from].order = ev.detail.to
      this.tanks[ev.detail.to].order = ev.detail.from

      let scope = this;

      this.tanks[ev.detail.from].forEach(function(value, key) {

        if(value['trueName']){
          scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + value['trueName'].toLowerCase())
          .set({
            groupOrder: ev.detail.to
          },{
            merge: true
          });
        }
      });

      this.tanks[ev.detail.to].forEach(function(value, key) {
        if(value['trueName']){
          scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + value['trueName'].toLowerCase())
          .set({
            groupOrder: ev.detail.from
          },{
            merge: true
          });
        }
      });

      ev.detail.complete();
      console.log('After complete tanks:', this.tanks);
    }

    doRefresh(event){
      this.showHead = false;
      this.populateTanks();
      this.populateWishlist();

      setTimeout(() => {
        console.log('Async operation has ended');
        event.target.complete();
      }, 1000);


    }

    populateUser(auth){
      this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid).valueChanges().subscribe(values => {
        this.user = values;

        this.populateTanks();
        this.populateWishlist();
      });
    }

    hideWishlist(){
      if(this.showWishlist){
        this.showWishlist = false;

        localStorage.setItem('showWishlist', 'false');
      }else{
        this.showWishlist = true;

        localStorage.setItem('showWishlist', 'true');
      }

      if(this.showWishlist){
        this.populateWishlist();
      }
    }

    hideTanks(){
      this.showTanks = !this.showTanks;
      this.groupingMode = false;

      if(this.showTanks){
        this.populateTanks();
      }
    }

    groupTanks(){
      this.groupingMode = !this.groupingMode;
      this.groupedTanks = [];
    }

    checkTankToGroup(tank, i){
      tank['checked'] = !tank['checked'];
      this.groupedTanks.push(tank)
    }

    async confirmCheckedTanks(){
      const alert = await this.alertController.create({
        header: 'Group Name',
        inputs: [
          {
            name: 'groupName',
            type: 'text',
            placeholder: 'Outside Tanks',
          }
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
          }, {
            text: 'Ok',
            handler: (data) => {
              if(data){
                this.currentGroup = data.groupName;
                this.proccessCheckedTanks();
              }
            }
          }
        ]
      });

      if(this.groupedTanks.length){
        await alert.present();
      }else{
        this.groupingMode = false;
      }
    }

    hideGroup(groupI){
      this.tanks[groupI].isHidden = !this.tanks[groupI].isHidden;
    }

    proccessCheckedTanks(){
      console.log(this.groupedTanks);

      this.groupedTanks.forEach(tank => {
        let trueName = tank['trueName'].toLowerCase();

        this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + trueName)
        .set({
          group: this.currentGroup,
          groupOrder: 0,
        },{
          merge: true
        });
      });

      this.tanks.forEach((tank, index) => {
        if(tank['checked']){
          tank['checked'] = false;
          this.tanks[index].group = this.currentGroup;
          this.tanks[index].groupOrder = 0;
        }
      });

      this.tanks = this.tanks;
      // this.currentGroup = '';
      // this.populateTanks();
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

        this.triggerWishlist();
      }
    }

    triggerWishlist(){
      this.wishListTrueSpeciesChanges = this.fireStore.collection('Species').valueChanges().subscribe(
      values =>{
        this.wishlistMode = true;
        let wishlistArray = [];

        //console.log(this.wishlist);

        if(this.wishlist){
          this.wishlist.forEach(eachSpecies => {
            values.forEach(eachWishlistSpecies => {
              if(eachSpecies['specCode'] == eachWishlistSpecies['specCode']){
                wishlistArray.push(eachWishlistSpecies)
              }
            });
          });

          this.wishlistItems = wishlistArray

          if(this.debug){
            console.log(this.wishlistItems);
          }

          //this.content.scrollToTop(400);


          this.wishListChanges.unsubscribe();
          this.wishListTrueSpeciesChanges.unsubscribe();
        }else{
          this.wishListChanges.unsubscribe();
          this.wishListTrueSpeciesChanges.unsubscribe();
        }

      }, error => {
        console.log(error);
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

      // Find follow count
      this.userTankChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/follows').valueChanges().subscribe(
      values =>{
        let followerCount = 0;

        if(values){
          values.forEach(follower => {
            followerCount++
          });

          this.totalQuanityOfFollows = followerCount;
        }

      });

      // Find Followers
      this.userTankChanges = this.fireStore.collection('Users').valueChanges().subscribe(values =>{
        let followsCount = 0;

        if(values && values['uid'] !== this.afAuth.auth.currentUser.uid){
          values.forEach(user => {
            this.checkCollection = this.fireStore.collection('Users/' + user['uid'] + '/follows').valueChanges().subscribe(specificUser => {
              specificUser.forEach(user => {
                //console.log(user['userID'] +' vs '+ this.afAuth.auth.currentUser.uid);
                if(user['userID'] == this.afAuth.auth.currentUser.uid){
                  followsCount++;
                }
              });

              this.totalQuanityOfFollowers = followsCount;
            });
          });
        }

      });


      if(this.afAuth.auth.currentUser.uid){
        this.userTankChanges = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks').valueChanges().subscribe(
        values =>{

          if(this.debug){
            console.log("Loading Tanks ...");
          }

          this.totalQuanityOfFish = 0;
          this.tanks = [];

          this.tanks = this.organiseGroups(values);
          this.tanks.sort((a, b) => (a.order > b.order) ? 1 : -1)

          if(this.debug){
            console.log(this.tanks);
          }

          if(this.repeatArrayTank){
            this.repeatArrayTank.unsubscribe();
          }

          if(!this.doneLoadingTanks){
            this.doneLoadingTanks = true;
          }

          // Find species count
          values.forEach(tankResult => {
            this.populateColours(tankResult)

            this.repeatArrayTank = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tankResult['trueName'].toLowerCase() + '/species').valueChanges().subscribe(
            species =>{

              species.forEach(speciesSpecific => {

                if(speciesSpecific['quantity']){
                  if(tankResult['speciesCount']){
                    tankResult['speciesCount'] = +tankResult['speciesCount'] + 1;
                  }else{
                    tankResult['speciesCount'] = 1;
                  }

                  if(tankResult['individualCount']){
                    tankResult['individualCount'] = +tankResult['individualCount'] + +Number(speciesSpecific['quantity']);
                  }else{
                    tankResult['individualCount'] = Number(speciesSpecific['quantity']);
                  }

                  this.totalQuanityOfFish = this.totalQuanityOfFish + +Number(speciesSpecific['quantity']);

                }

              });

            });
          });

          // THIS IS SEPERATLY POPULATING FISH COUNT :)
          let wishlistLoop = setInterval(()=>{
            if(this.totalQuanityOfFish){
              clearInterval(wishlistLoop)

              let fishCount;

              if(this.totalQuanityOfFish){
                fishCount = this.totalQuanityOfFish
              }else{
                fishCount = 0
              }

              this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid)
              .set({
                fishCount: fishCount,
                following: this.totalQuanityOfFollows,
                followers:  this.totalQuanityOfFollowers
              },{
                merge: true
              }).then(() => {
                this.userTankChanges.unsubscribe();
                this.checkCollection.unsubscribe();

              });
            }
          }, 300);

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

    organiseGroups(tanks){
      if(this.debug){
        console.log('Organising Groups ...');
      }

      let tempGroupNames = [];
      let tempGroupOrders = [];
      this.groupedTanks = [];

      let group = tanks.reduce((r, a) => {
       if(!a.group){
         a.group = ''
       }

       r[a.group] = [...r[a.group] || [], a];
       r[a.group].sort((one, two) => (one.order > two.order) ? 1 : -1)

       tempGroupNames.push(a.group);

       return r;
      }, {});

      
      if(this.debug){
        console.log(tempGroupOrders);
      }

      let groupNames = this.removeDuplicatesBy(x => x, tempGroupNames);
      let groupOrders = this.removeDuplicatesBy(x => x, tempGroupOrders);

      for(var i = 0; i < groupNames.length; i++){
       this.groupedTanks.push(group[groupNames[i]]);

       if(groupNames[i]){
         this.groupedTanks[i].name = groupNames[i];
       }else{
         this.groupedTanks[i].name = '';
       }
      }

      for(var i = 0; i < this.groupedTanks.length; i++){
        this.groupedTanks[i].order = this.groupedTanks[i][0].groupOrder;
      }

      return this.groupedTanks;
    }

    deleteGroup(groupI){

      this.tanks[groupI].name = '';
      this.tanks[groupI].order = '';

      this.tanks[groupI].forEach(tank => {
        tank.group = '';

        let trueName = tank['trueName'].toLowerCase();
        this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + trueName)
        .set({
          group: '',
          groupOrder: '',
        },{
          merge: true
        });

        tank.group = '';
        tank.groupOrder = '';
      });

      console.log(this.tanks)

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

    removeDuplicatesBy(keyFn, arr){
      var mySet = new Set();
      return arr.filter(function(x) {
        var key = keyFn(x), isNew = !mySet.has(key);
        if (isNew) mySet.add(key);
        return isNew;
      });
    }

    addUserToFirebase(auth){
      let name;

      if(auth.displayName){
        name = auth.displayName;
      }else{
        name = localStorage.getItem('userName');

        if(name){
          localStorage.removeItem('userName')
        }else{
          name = auth.email;
        }
        
      }

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
      }).then(() => {
        console.log('User Added!')
        this.populateUser(auth);
      });

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
      this.router.navigateByUrl('/tanks/' + this.afAuth.auth.currentUser.uid + '/' + tankname);
    }


    // Switch to newTank mode
    addTank(){
      this.addTankMode = true;
      this.defaultMode = false;
      this.tankDetailMode = false;
      this.addChemistryMode = false;

      this.content.scrollToTop(400);
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

   closeAddTank() {
     this.defaultMode = true;
     this.addTankMode = false;
     this.tankDetailMode = true;
     this.addChemistryMode = false;
   }

  // Submit tank to database
  confirmForm(){
    let tankAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.tank.name.toLowerCase());

    console.log('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.tank.name.toLowerCase());

    tankAddress.set({
      name: this.tank.name,
      trueName: this.tank.name,
      ph: this.tank.ph,
      temp: this.tank.temp,
      size: this.tank.size,
      isSaltwater: this.tank.isSaltwater,
      isBrackish: this.tank.isBrackish,
      substrate: this.tank.substrate,
      order:  0,
      colourNumber: 1
    },{
      merge: true
    }).then(() => {
      this.addTankMode = false;
      this.defaultMode = true;

      this.populateTanks();
      this.content.scrollToTop(400);
    });

  }

  openSpeciesSearch() {
    this.router.navigateByUrl('/tabs/search');
  }

  triggerReorder(){
    this.reorderMode = true;
  }

  triggerAdmin(){
    this.router.navigateByUrl('admin');
  }

  // Route the user back to the login page
  logout(){
    console.log('Logging out...')

    this.afAuth.auth.signOut().then(() => {
       //this.router.navigateByUrl('/login');
       location.reload();
    });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Settings',
      buttons: [{
        text: 'Manually Add Species',
        icon: 'plus-outline',
        handler: () => {
          this.triggerAdmin();
        }
      }, {
        text: 'Change Profile Photo',
        icon: 'plus-outline',
        handler: () => {
          document.getElementById('file-input').click();
        }
      },{
        text: 'Logout',
        role: 'destructive',
        icon: 'log-out-outline',
        handler: () => {
          this.logout();
        }
      }]
    });
    await actionSheet.present();
  }



  changeColour(tank, index){
    
    this.canLoadTank = true;
    this.colourFound = false;
    this.userTankChanges.unsubscribe();

    let amountOfColours = 15;

    if(tank["name"] && this.canLoadTank){
      this.colourDoc = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank["name"].toLowerCase()).valueChanges().subscribe(
      tank =>{

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
       
        this.tanks.forEach((i, masterKey) => {
          i.forEach((value, key) => {
            if(value.trueName == tank['trueName']){
              if(currentColour['third']){
                this.tanks[masterKey][key].fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ', ' + currentColour['third'] + ')';
              }else{
                this.tanks[masterKey][key].fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ')';
              }
            }
          });
        });

        if(tank["name"]){
          this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + tank["name"].toLowerCase())
          .set({
            colourNumber: counterNumber
          },{
            merge: true
          }).then(() => {
            this.canLoadTank = false;
            this.colourFound = true;

            this.tanks = this.tanks;
            this.tanksHold = this.tanks;
            //this.tanks.sort((a, b) => (a.order > b.order) ? 1 : -1)
            this.colourDoc.unsubscribe();
          });
        }

        this.colourDoc.unsubscribe();

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


  closeTank() {
    this.defaultMode = true;
    this.addTankMode = false;
    this.tankDetailMode = false;
    this.addChemistryMode = false;
    this.fishLoaded = false;
    this.activeTankData = null;
    this.fish_in_tank = [];
    this.dividers = [];
    this.tankFishQuantity = 0;
  }

  async showSaltwaterAlert(){
    const alert = await this.alertController.create({
      header: 'An ocean fish.',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary', }, {
        text: 'Ok' }]
    });

    alert.present();
  }

  async showBrackishAlert(){
    const alert = await this.alertController.create({
      header: 'Brackish water is water having more salinity than freshwater, but not as much as seawater. This forms in estuaries. Popular species includes Monos, eyespot puffers, archerfish & many mussels, snails & turtles',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary', }, {
        text: 'Ok' }]
    });

    alert.present();
  }

  triggerFreshwater(){
    this.tank.isBrackish = false
  }

  triggerBrackish(){
    this.tank.isSaltwater = false
  }

  changeProfilePhoto(event) {
    console.log('UPLOAD A PROFILE IMAGE');
    this.presentLoading();

    const file = event.target.files[0];
    let randomID = Math.floor(Math.random() * 1000);
    const filePath = this.afAuth.auth.currentUser.uid + '/Profile Images/' + randomID;
    const fileRef = this.storage.ref(filePath)
    const task = this.storage.upload(filePath, file);

    task.snapshotChanges().pipe( finalize(() => {
          const downloadURL = fileRef.getDownloadURL();

          downloadURL.subscribe(url=>{
             if(url){
               this.dismissLoading();
               console.log(url);
               this.user['photoURL'] = url;

                this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid)
                .set({
                  pic: url
                },{
                  merge: true
                });
             }
          })

        })
     )
    .subscribe();
  }
}
