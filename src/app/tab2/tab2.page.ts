import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { SelectTankSubstratePage } from '../modal/select-tank-substrate/select-tank-substrate.page';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

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

  tanks: any;
  doneLoadingTanks = false;

  activeTankData: object = null;

  lastChemistrySessionDate: Date = null;
  lastChemistrySession: object = null;

  constructor(
    public modalCtrl : ModalController,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private router: Router
  ) {}

  ngOnInit() {

    console.log("Loading Tanks ...");

    // Pull Tanks from Database
    this.currentUser = localStorage.getItem('auth');

    if(this.currentUser){
      this.fireStore.collection('Users/' + this.currentUser + '/tanks').valueChanges().subscribe(
      values =>{
        this.tanks = values;
        if(!this.doneLoadingTanks){
          this.doneLoadingTanks = true;
        }
      });
    }else{
      console.log('Gotta log in');
      // this.logout();
    }
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

      } else {
        console.log("Cannot find tank data");
      }
    });
    // .then(data => {
    //
    // })
  }

  addTank(){
    this.addTankMode = true;
    this.defaultMode = false;
    this.tankDetailMode = false;
    this.addChemistryMode = false;
  }

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

  logout(){
    console.log('Logging out...')

    this.afAuth.auth.signOut().then(() => {
       this.router.navigateByUrl('/login');
    });
  }

}
