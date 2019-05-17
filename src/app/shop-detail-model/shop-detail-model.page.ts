import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-shop-detail-model',
  templateUrl: './shop-detail-model.page.html',
  styleUrls: ['./shop-detail-model.page.scss'],
})
export class ShopDetailModelPage implements OnInit {
  shopName: string;
  shopImage: string;
  shopAddress: string;
  shopLat: number;
  shopLng: number;

  constructor(params: NavParams, private modalCtrl: ModalController) {
    var returnedShop = params.get('shop');

    console.log(returnedShop);
    this.shopName = returnedShop['name'];
    this.shopImage = returnedShop['img'];
    this.shopAddress = returnedShop['address'];
    this.shopLat = returnedShop['lat'];
    this.shopLng = returnedShop['lng'];

  }

  ngOnInit() {}

  goDown(){
    this.modalCtrl.dismiss();
  }

}
