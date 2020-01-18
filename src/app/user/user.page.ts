import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {

  // switches
  debug: boolean = false;
  userLoaded: boolean;

  // numbers
  totalQuanityOfFish: number = 0;

  // collections
  userCollection: any;
  userTankCollection: any;
  colourCollection: any;

  // arrays
  user: any = [];
  tanks: any = [];

  constructor(
    private location: Location,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private router: Router
  ) { }

  ngOnInit() {
    let userID = window.location.pathname;
    let userIDFinal = userID.replace('/users/', '');

    this.userCollection = this.fireStore.doc('Users/' + userIDFinal).valueChanges().subscribe(
    user =>{
      if(!user){
        console.log('Can\'t Find user...');
        setTimeout(()=>{
          this.location.back();
        });

      }else{
        console.log(user);
        this.user = user;

        this.generateUserTanks(user)

        this.userLoaded = true;
        this.userCollection.unsubscribe();
      }
    });

  }

  generateUserTanks(user){
    console.log('### GENERATE USERS TANKS ###')
    console.log('Users/' + user.uid + '/tanks/');

    this.userTankCollection = this.fireStore.collection('Users/' + user.uid + '/tanks/').valueChanges().subscribe(
    tanks =>{
      console.log(tanks)
      this.tanks = tanks;

      tanks.forEach(tankResult => {
        this.populateColours(tankResult);
      });

    }, error => {
      console.log(error)
    });

  }

  populateColours(tankResult){
    let currentNum = tankResult['colourNumber']

    this.colourCollection = this.fireStore.collection('Colours').valueChanges().subscribe(
    values =>{

      console.log(values);
      console.log(currentNum)

      let currentColour = values[currentNum];

      if(!currentColour){
        console.log('CANT GET COLOUR FOR OBJ')
      }else if(currentColour['third']){
        tankResult.fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ', ' + currentColour['third'] + ')';
      }else{
        tankResult.fullColour = 'linear-gradient(to right, ' + currentColour['first'] + ', ' + currentColour['second'] + ')';
      }

      this.colourCollection.unsubscribe();
    });
  }

  initTankDetail(tankname){
    this.router.navigateByUrl('/tanks/' + this.user.uid + '/' + tankname);
  }

  goHome(){
    this.userLoaded = false;
    this.totalQuanityOfFish = 0;

    if(this.userCollection)
    this.userCollection.unsubscribe();
    if(this.userTankCollection)
    this.userTankCollection.unsubscribe();
    if(this.colourCollection)if(this.userCollection)
    this.colourCollection.unsubscribe();

    this.user = [];
    this.tanks = [];

    setTimeout(()=>{
      this.location.back();
    });
  }

  followUser(){
    console.log('### FOLLOW USER ###')

    let userFollowersAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/follows/' + this.user.uid);
    userFollowersAddress.set({
      name: this.user.name,
      dateSet: new Date(),
      userID: this.user.uid
    });

    alert('You are now following ' +  this.user.name);
  }

}
