import { Component, OnInit } from '@angular/core';

import { ModalController } from '@ionic/angular';

import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-add-shop-modal',
  templateUrl: './add-shop-modal.page.html',
  styleUrls: ['./add-shop-modal.page.scss'],
})
export class AddShopModalPage implements OnInit {

  name: string;

  shop = {
    name: '',
    image: '',
    address: '',
    latitude: '',
    longitude: ''
  };

  constructor(public fireStore: AngularFirestore,
  private modalCtrl:ModalController) { }

  ngOnInit() {
  }

  saveShop(){
    let tankAddress = this.fireStore.doc<any>('Shops/' + this.shop.name);

    tankAddress.set({
      name: this.shop.name,
      img: this.shop.image,
      address: this.shop.address,
      lat: Number(this.shop.latitude),
      lng: Number(this.shop.longitude)
    });

    alert("Shop Added Succesfully!")
    this.modalCtrl.dismiss();
  }

  cancel(){
    this.modalCtrl.dismiss();
  }
}
