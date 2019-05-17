import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

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
    substrate: ''
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
    .get().toPromise()
    .then(data => {
      if(data.exists){
        // console.log(data);
        this.activeTankData = data.data();
        console.log(this.activeTankData);

        this.tankDetailMode = true;
        this.defaultMode = false;
        this.addTankMode = false;
        this.addChemistryMode = false;

        this.initChemistry();

      } else {
        console.log("Cannot find tank data");
      }
    })
  }

  addTank(){
    this.addTankMode = true;
    this.defaultMode = false;
    this.tankDetailMode = false;
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

  logout(){
    console.log('Logging out...')

    this.afAuth.auth.signOut().then(() => {
       this.router.navigateByUrl('/login');
    });
  }

}
