import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

import { AngularFirestore } from 'angularfire2/firestore';

import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  addTankMode: boolean;

  tank = {
    name: '',
    ph: 0,
    temp: 0,
    size: 0,
    substrate: ''
  };

  tanks: any;

  constructor(
    public modalCtrl : ModalController,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth
  ) {

    // Pull Tanks from Database
    this.fireStore.collection('tanks').valueChanges().subscribe(
    values =>{
      this.tanks = values;
    });
  }

  addTank(){
    this.addTankMode = true;
  }

  // Submit tank to database

  confirmForm(){
    this.addTankMode = false;
    console.log(this.tank);

    let tankAddress = this.fireStore.doc<any>(this.afAuth.auth.currentUser.uid + 'tanks/' + this.tank.name);

    tankAddress.set({
      name: this.tank.name,
      ph: this.tank.ph,
      temp: this.tank.temp,
      size: this.tank.size,
      substrate: this.tank.substrate
    })

    alert('Tank added')
  }

}
