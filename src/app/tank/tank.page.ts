import { Component, ViewChild, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { IonContent, Platform, ModalController, LoadingController, AlertController } from '@ionic/angular';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';

import { SelectTankSubstratePage } from '../modal/select-tank-substrate/select-tank-substrate.page';

@Component({
  selector: 'app-tank',
  templateUrl: './tank.page.html',
  styleUrls: ['./tank.page.scss'],
})
export class TankPage implements OnInit {

  @ViewChild(IonContent) content: IonContent;

  // switches
  debug: boolean = false;
  showLocalUpload: boolean;
  tankDetailMode: boolean;
  defaultMode: boolean;
  addTankMode: boolean;
  addChemistryMode: boolean;
  fishLoaded: boolean;
  trashMode: boolean;
  reorderMode: boolean;
  commenting: boolean;

  // strings
  tankUser: string;
  tankName: string;

  // numbers
  tankFishQuantity: number = 0;

  // collections
  tankDetailChanges: any;
  tankChanges: any;
  dividerChanges: any;
  deleteAllSpecies: any;
  deleteAllDividers: any;

  // arraysf
  activeTankData: any = [];
  fish_in_tank: any = [];
  dividers: any = [];


  constructor(
    public plt: Platform,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private location: Location,
    private storage: AngularFireStorage,
    public loadingController: LoadingController,
    public alertController: AlertController,
    public modalCtrl : ModalController,
    public router : Router,
  ) { }

  ngOnInit() {

    console.clear();


    let fullURL = window.location.pathname.split("/");


    let userNameFinal = fullURL[2];
    let tankNameFinal = fullURL[3].toLowerCase().replace(/%20/gi, ' ');

    this.tankUser = userNameFinal;
    this.tankName = tankNameFinal;

    console.log('Users/' + userNameFinal + '/tanks/' + tankNameFinal);

    if (this.plt.is('ios') || this.plt.is('android')) {
      this.showLocalUpload = false;
    }{
      this.showLocalUpload = true;
    }

    this.tankDetailMode = true;
    this.tankDetailChanges = this.fireStore.doc('Users/' + userNameFinal + '/tanks/' + tankNameFinal)
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

        // this.initChemistry();
        // this.calculateAveragePH();

        this.content.scrollToTop(400);
        this.tankDetailChanges.unsubscribe();

      } else {
        console.log("Cannot find tank data");
        this.location.back();
      }
    });

    setTimeout(()=>{
      this.getFish();
      this.getDividers();
    }, 500);

  }



  getFish() {

    this.tankChanges = this.fireStore.collection('Users/' + this.tankUser + '/tanks/' + this.tankName + '/species').valueChanges().subscribe(values => {
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
      }, 500);

    });
  }




  getDividers(){
    if(this.debug){
      console.log('Grabbing dividers..');
    }

    this.dividerChanges = this.fireStore.collection('Users/' + this.tankUser + '/tanks/' + this.tankName + '/dividers').valueChanges().subscribe(values => {
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

  async addDivider() {
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
          this.presentLoading();
          this.fish_in_tank = []

          let count = Math.floor(Math.random() * 1000);

          let dividerName = data.divider_name
          let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/dividers/' + count);

          tankAddress.set({
            dateSet: new Date(),
            name: dividerName,
            order: 0,
            id: count
          },{
            merge: true
          }).then(() => {
            console.log("Divider added to tank!");

            this.getFish();
            this.getDividers();

            this.fish_in_tank.sort((a, b) => (a.order > b.order) ? 1 : -1)

            this.dismissLoading();
          });


          //this.restartTank();
          //this.closeTank();
        }
      }
    ]
  });

  await alert.present();
}



restartTank(){
  console.log('restarting tank..')
  this.fish_in_tank = [];
  this.dividers = [];
  this.tankFishQuantity = 0;

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


  setTimeout(()=>{
    this.location.back();
  });

}




    deleteDivider(divider){
      this.presentLoading();
      this.fish_in_tank = [];
      console.log('deleteing divider...')

      let dividerAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase() + "/dividers/" + divider['id']);
      let scope = this;
      //this.fish_in_tank = []

      dividerAddress.delete()
      .then(function() {

        scope.getFish();
        scope.getDividers();

        scope.fish_in_tank.sort((a, b) => (a.order > b.order) ? 1 : -1)
        scope.dismissLoading();
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

            let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/dividers/' + fish['id']);

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

            let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/species/' + fish['spec_code']);

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

    let commName = fish['comm_name'].charAt(0).toUpperCase() + fish['comm_name'].slice(1);

    const alert = await this.alertController.create({
      header: commName + "\'s Nickname",
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

            let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/species/' + fish['spec_code']);

            console.log('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/species/' + fish['spec_code']);

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
      this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase())
      .set({
        temp: value
      },{
        merge: true
      });
    } else {
      if(this.debug)
      console.log("tank temp cannot be 0 or null ! Try again dweeb :)");
    }
  }

  // Update tank size
  updateTankSize(value) {
    if(value > 0) {
      this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase())
      .set({
        size: value
      },{
        merge: true
      });
    } else {
      if(this.debug)
      console.log("tank size cannot be 0 or null ! Try again dweeb :)");
    }
  }

  // Save substrate data
  updateTankSubstrate(value) {
    if(value) {
      this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase())
      .set({
        substrate: value
      },{
        merge: true
      });
    } else {
      if(this.debug)
      console.log("tank substrate cannot be 0 or null ! Try again dweeb :)");
    }
  }

  doReorder(ev: any) {
    console.log('Before complete fish:', this.fish_in_tank);

    let scope = this;

    this.fish_in_tank = ev.detail.complete(this.fish_in_tank);

    setTimeout(()=>{

      this.fish_in_tank.forEach(function(value, key) {

        if(value['type'] == 'divider'){
          //console.log('Setting ' + key + " to divider " + value['id'])
          //console.log('setting to ' + 'Users/' + scope.currentUser + '/tanks/' + scope.activeTankData['name'] + '/dividers/' + value['name']);
          scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + scope.activeTankData['name'].toLowerCase() + '/dividers/' + value['id'])
          .set({
            order: key
          },{
            merge: true
          });
        }

        if(value['type'] == 'fish'){
          //console.log('Setting ' + key + " to fish " + value['genus'])
          //console.log('setting to ' + 'Users/' + scope.currentUser + '/tanks/' + scope.activeTankData['name'] + '/species/' + value['spec_code']);
          scope.fireStore.doc('Users/' + scope.afAuth.auth.currentUser.uid + '/tanks/' + scope.activeTankData['name'].toLowerCase() + '/species/' + value['spec_code'])
          .set({
            order: key
          },{
            merge: true
          });
        }

      });

      console.log('After complete fish:', this.fish_in_tank);

    }, 500);


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



  async deleteFishFromTank(fish){

    console.log(fish);

    const alert = await this.alertController.create({
      header: 'Are you sure you want to remove your ' + fish['comm_name']  + '?',
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
          text: 'Remove',
          cssClass: 'warning',
          handler: (data) => {
            this.presentLoading();

            this.tankFishQuantity = 0;

            let fishAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase() + "/species/" + fish['spec_code']);
            let scope = this;
            //this.fish_in_tank = [];

            fishAddress.delete()
            .then(function() {

              scope.getFish();
              scope.fish_in_tank.sort((a, b) => (a.order > b.order) ? 1 : -1)
              scope.dismissLoading();

            });

          }
        }
      ]
    });

    await alert.present();

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

    let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/species/' + fish['spec_code']);

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

          let commentAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase() + '/species/' + fish['spec_code']);

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
           let tankAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase());

           this.deleteAllSpecies = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase() + '/species').valueChanges().subscribe(
           species =>{
             species.forEach(result => {
               console.log(result)
               let resultAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase() + '/species/' + result['specCode']);
               resultAddress.delete();
             });
           });

           this.deleteAllDividers = this.fireStore.collection('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase() + '/dividers').valueChanges().subscribe(
           species =>{
             species.forEach(result => {
               console.log(result)
               let resultAddress = this.fireStore.doc<any>('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData["name"].toLowerCase() + '/dividers/' + result['id']);
               resultAddress.delete();
             });
           });

           tankAddress.delete()
           .then(function() {
             scope.deleteAllSpecies.unsubscribe();
             scope.deleteAllDividers.unsubscribe();
             scope.defaultMode = true;
             scope.addTankMode = false;
             scope.tankDetailMode = false;
             scope.addChemistryMode = false;
             scope.activeTankData = null;
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
    tankName = this.activeTankData['name'].toLowerCase()
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
          let tankAddress = this.fireStore.doc('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase());
          console.log('setting to ' + ('Users/' + this.afAuth.auth.currentUser.uid + '/tanks/' + this.activeTankData['name'].toLowerCase()))

          tankAddress.set({
            nickname: String(newTankName)
          },{
            merge: true
          }).then(() => {
            this.activeTankData['name'] = String(newTankName);

            console.log("Tank name changed to " + String(newTankName));
          });

        }
      }
    ]
  });

  await alert.present();
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

closeChemistrySession() {
  this.defaultMode = false;
  this.addTankMode = false;
  this.tankDetailMode = true;
  this.addChemistryMode = false;
}


}
