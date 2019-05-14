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

  tank = {
    name: '',
    ph: 0,
    temp: 0,
    size: 0,
    substrate: ''
  };

  tanks: any;
  doneLoadingTanks = false;

  activeTankData: object = null;

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

      } else {
        console.log("Cannot find tank data");
      }
    })
  }

  addTank(){
    this.addTankMode = true;
    this.defaultMode = false;
    this.tankDetailMode = false;
  }

  // Submit tank to database
  confirmForm(){
    this.addTankMode = false;
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
