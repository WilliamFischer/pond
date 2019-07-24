import { Component, ViewChild } from '@angular/core';
import { IonContent, ModalController, NavParams } from '@ionic/angular';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import {HttpClient} from "@angular/common/http";

// Native
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

import * as firebase from 'firebase/app';

import { SelectTankSubstratePage } from '../modal/select-tank-substrate/select-tank-substrate.page';
import { FishDetailPage } from '../modal/fish-detail/fish-detail.page';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page {

  @ViewChild(IonContent) content: IonContent;

  currentUser: any;

  defaultMode: boolean = true;
  addTankMode: boolean = false;
  tankDetailMode: boolean = false;
  addChemistryMode: boolean = false;

  tank = {
    name: '',
    ph: 0,
    temp: 0,
    size: 0,
    substrate: '',
    average_ph: 0
  };

  chemistry = {
    ph: 0.0,
    ammonia: 0.0,
    nitrite: 0.0,
    nitrate: 0.0
  }

  fish_in_tank: any = [];
  user: any = [];

  tanks: any;
  doneLoadingTanks = false;

  activeTankData: object = null;

  lastChemistrySessionDate: Date = null;
  lastChemistrySession: object = null;
  totalQuanityOfFish: number = 0;


  constructor(
    public modalCtrl : ModalController,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private router: Router,
    private http:HttpClient,
    private camera: Camera
  ) { }


    ngOnInit() {

      console.log("Loading Tanks ...");

      // Pull Tanks from Database
      this.currentUser = localStorage.getItem('auth');

      //console.log(this.currentUser)

      //Populate user
      this.afAuth.authState.subscribe(auth=>{
        console.log(auth);
        this.user.name = auth.displayName;
        this.user.photoURL = auth.photoURL
        this.user.email = auth.email
        this.user.phoneNumber = auth.phoneNumber
      });

      // Check if user exists
      if(this.currentUser){
        this.fireStore.collection('Users/' + this.currentUser + '/tanks').valueChanges().subscribe(
        values =>{
          this.tanks = values;
          if(!this.doneLoadingTanks){
            this.doneLoadingTanks = true;
          }

          // Find species count
          values.forEach(tankResult => {
            this.fireStore.collection('Users/' + this.currentUser + '/tanks/' + tankResult['name'] + '/species').valueChanges().subscribe(
            species =>{
              species.forEach(speciesSpecific => {
                this.totalQuanityOfFish = +this.totalQuanityOfFish + +Number(speciesSpecific['quantity']);
              });
            });
          });

        });
      }else{
        console.log('Gotta log in');
        // this.logout();
      }
    }

    // fish_in_tank = {
    //   general_name: '',
    //   scientific_name: '',
    //   specCode: 1023,
    //   quantity: 1
    // }

    getFish() {

      this.fireStore.collection('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'] + '/species').valueChanges().subscribe(values => {
        console.log(this.fish_in_tank);
        values.forEach(fish => {

            let comm_name = fish['name'];
            let quantity = fish['quantity'];
            let specCode = fish['specCode'];
            let sci_name = fish['sciName'];

            let fishObj = {
              'comm_name': comm_name,
              'sci_name': sci_name,
              'spec_code': specCode,
              'quantity': quantity
            }

            this.fish_in_tank.push(fishObj);

        });

        console.log(this.fish_in_tank);
      });

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

    openNewChemistrySession() {
      this.tankDetailMode = false;
      this.defaultMode = false;
      this.addTankMode = false;
      this.addChemistryMode = true;
    }

    // Submit tank to database
    confirmChemistryForm(){
      this.addChemistryMode = false;
      this.tankDetailMode = true;

      console.log("success");

      let id = this.fireStore.createId();

      let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'] + '/chemistry/' + id);

      tankAddress.set({
        date: new Date(),
        ph: this.chemistry.ph,
        ammonia: this.chemistry.ammonia,
        nitrite: this.chemistry.nitrite,
        nitrate: this.chemistry.nitrate
      });

      alert('New Chemistry Session Added')
    }

    calculateAveragePH() {
      var scope = this;
      this.fireStore.collection('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'] + '/chemistry')
      .valueChanges().forEach(data => {
        let _total = 0;

        for(var i = 0; i < data.length; i++){
          let ph = data[i]["ph"];
          _total += +ph;
        }

        let avg_ph = _total / data.length;
        scope.activeTankData["average_ph"] = avg_ph;
        console.log("ASYNC: Average tank pH update");
      });
    }

    initChemistry() {
      if(this.activeTankData) {
        this.fireStore.collection('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'] + '/chemistry')
        .ref.orderBy("date", "desc").limit(1)
        .get().then(data => {
          if(data.docs.length > 0){
            this.lastChemistrySession = data.docs[0].data();
            let secs = +this.lastChemistrySession["date"]["seconds"];
            console.log(secs);
            this.lastChemistrySessionDate = new Date(secs * 1000);
            console.log(this.lastChemistrySessionDate);
          } else {
            this.lastChemistrySession = null;
            console.log("No chemistry sessions located");
            return;
          }
        })
      }
    }

    initTankDetail(tankname){
      this.tankDetailMode = true;
      this.fireStore.doc('Users/' + this.currentUser + '/tanks/' + tankname)
      .valueChanges().subscribe(data => {
        if(data){
          // console.log(data);
          this.activeTankData = data;
          console.log("ASYNC: Refreshing active tank object");
          console.log(this.activeTankData);

          this.tankDetailMode = true;
          this.defaultMode = false;
          this.addTankMode = false;
          this.addChemistryMode = false;

          this.initChemistry();
          this.calculateAveragePH();
          this.getFish();

        } else {
          console.log("Cannot find tank data");
        }
      });
      // .then(data => {
      //
      // })

      this.content.scrollToTop(400);

    }

    // Switch to newTank mode
    addTank(){
      this.addTankMode = true;
      this.defaultMode = false;
      this.tankDetailMode = false;
      this.addChemistryMode = false;
    }

    // Update tank temperature
    updateTankTemp(value) {
      if(value > 0) {
        this.fireStore.doc('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'])
        .set({
          temp: value
        },{
          merge: true
        });
      } else {
        console.log("tank temp cannot be 0 or null ! Try again dweeb :)");
      }
    }

    // Update tank size
    updateTankSize(value) {
      if(value > 0) {
        this.fireStore.doc('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'])
        .set({
          size: value
        },{
          merge: true
        });
      } else {
        console.log("tank size cannot be 0 or null ! Try again dweeb :)");
      }
    }

    // Save substrate data
    updateTankSubstrate(value) {
      if(value) {
        this.fireStore.doc('Users/' + this.currentUser + '/tanks/' + this.activeTankData['name'])
        .set({
          substrate: value
        },{
          merge: true
        });
      } else {
        console.log("tank substrate cannot be 0 or null ! Try again dweeb :)");
      }
    }

    // Show fish detail modal
    async openFishDetailModal(fish, tankData) {
     console.log("creating fish detail modal");
     const modal = await this.modalCtrl.create({
       component: FishDetailPage,
       componentProps: { fish: fish, tank: tankData }
     });

     modal.onDidDismiss().then(modalData => {
       // this.updateCallType(modalData.data);
       console.log("Fish edit finished");
       console.log(modalData.data);
       // Make sure you pass the value object
       // this.updateTankSubstrate(modalData.data["value"]);
     })

     return await modal.present();
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
       let scope = this;
       let tankAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"]);
       tankAddress.delete()
       .then(function() {
         scope.defaultMode = true;
         scope.addTankMode = false;
         scope.tankDetailMode = false;
         scope.addChemistryMode = false;
         scope.activeTankData = null;
       });
     }

     closeTank() {
       this.defaultMode = true;
       this.addTankMode = false;
       this.tankDetailMode = false;
       this.addChemistryMode = false;
       this.activeTankData = null;
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

      tankAddress.set({
        name: this.tank.name,
        ph: this.tank.ph,
        temp: this.tank.temp,
        size: this.tank.size,
        substrate: this.tank.substrate
      });

      alert('Tank added')
    }

    openSpeciesSearch() {
      this.router.navigateByUrl('/tabs/species');
    }

    // Add a tank image to the database
    tankUpload(){
      const options: CameraOptions = {
         quality: 30,
         destinationType: this.camera.DestinationType.DATA_URL,
         encodingType: this.camera.EncodingType.JPEG,
         mediaType: this.camera.MediaType.PICTURE,
         sourceType:this.camera.PictureSourceType.PHOTOLIBRARY,
         targetWidth:1080,
         targetHeight:1080,
         allowEdit:true
      }


     this.camera.getPicture(options).then((imageData) => {
      // imageData is a base64 encoded string
      let base64Image = 'data:image/jpeg;base64,' + imageData;
      console.log('base64Image')
      this.addPicture(base64Image)
     }, (err) => {
      // Handle error
      console.log(err)
     });
    }

    addPicture(base64Image:string){
      var filePath = "";
      if(base64Image){

        console.log("Uploading image " + " to " + filePath + "...")
        var storageRef = firebase.storage().ref();
        var ref = storageRef.child(filePath)
        console.log('made it here')
        try{
           ref.putString(base64Image, firebase.storage.StringFormat.DATA_URL).then(res1=>{
              console.log("Uploaded")
              console.log(res1);
              res1.ref.getDownloadURL().then(url=>{
                 if(url){
                    console.log('Got url')
                   console.log(url)
                 }
                console.log('image done @ ' + url);
              })
           });
        }catch(e){
           console.log(e)
        }

      }else{
        console.log("NO FILE UPLOADED")
      }
    }

  // Route the user back to the login page
  //
  logout(){
    console.log('Logging out...')

    this.afAuth.auth.signOut().then(() => {
       this.router.navigateByUrl('/login');
    });
  }
}
