import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from 'angularfire2/firestore';
import {Location} from '@angular/common';

import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
})
export class AdminPage implements OnInit {

  speciesToAdd : any = {};
  pics : any = {};

  password : string;

  constructor(
    public fireStore: AngularFirestore,
    private location: Location,
    public alertController: AlertController,
  ) { }

  ngOnInit() {
    this.speciesToAdd.fresh = true;
  }

  logForm(){
    console.log(this.password)
    console.log(this.pics);

    if(this.password == '133'){
      let checkSpecCode = this.fireStore.collection('Species').valueChanges().subscribe(results => {

        this.speciesToAdd.specCode = Math.floor(Math.random() * (results.length * 100));
        this.speciesToAdd.versionCode = localStorage.getItem('runningVersion');
        this.speciesToAdd.customSpecies = true;
        this.speciesToAdd.species = this.speciesToAdd.species.toLowerCase();
        this.speciesToAdd.genus = this.speciesToAdd.genus.toLowerCase();
        if(this.speciesToAdd.name){this.speciesToAdd.name = this.speciesToAdd.name.toLowerCase()}

        console.log(this.speciesToAdd);

        if(this.speciesToAdd.fresh){
          this.speciesToAdd.fresh = -1;
        }else{
          this.speciesToAdd.fresh = 0;
        }

        if(!this.speciesToAdd.name){
          this.speciesToAdd.name = this.speciesToAdd.genus + ' ' + this.speciesToAdd.species;
        }

        setTimeout(() => {

          let counter = 0;

          for(let i in results){
            if(results[i]['specCode'] == this.speciesToAdd.specCode){
              console.log('INVALID SPEC CODE');
              this.logForm();
            }else{
              counter++;
            }
          }

          if(counter == results.length){
            console.log("### ADDING SPECIES ###");

            checkSpecCode.unsubscribe();
            this.addSpecies();
          }

        }, 1000);

      });
    }else{
      alert('Wrong Password!')
    }

  }

  addSpecies(){
    if(this.speciesToAdd.specCode && this.speciesToAdd.versionCode){
      let speciesAddress = this.fireStore.doc<any>('Species/' + this.speciesToAdd.specCode);

      speciesAddress.set(this.speciesToAdd, {
        merge: true
      });

      speciesAddress.update({
        Pics:this.pics
      });


      console.log('Success with code ' + this.speciesToAdd.specCode + '!');
      alert('Species Confirmed with code ' + this.speciesToAdd.specCode + '!')
    }else{
      alert('Couldnt generate Spec Code :(');
    }
  }

  async goHome(){

    const alert = await this.alertController.create({
      header: 'Are you sure you want to go back? Progress will be lost',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Back',
          cssClass: 'warning',
          handler: (data) => {
            this.location.back();
          }
        }
      ]
    });

    if(this.speciesToAdd.species && this.speciesToAdd.genus){
      await alert.present();
    }else{
      this.location.back();
    }

  }

}
