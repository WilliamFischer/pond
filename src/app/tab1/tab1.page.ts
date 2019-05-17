import { Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import {Geolocation} from '@ionic-native/geolocation/ngx';

import { AlertController, ModalController } from '@ionic/angular';

import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from '@angular/fire/auth';

import { AddShopModalPage } from '../add-shop-modal/add-shop-modal.page'
import { ShopDetailModelPage } from '../shop-detail-model/shop-detail-model.page'

declare var google: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  @ViewChild('Map') mapElement: ElementRef;

  // Establish the Date
  today = Date.now();
  location = {lat: 0, lng: 0};
  markerOptions: any = {position: null, map: null, title: null};
  marker: any;
  mapFail: boolean;
  newsMode: boolean;
  stores: any[];

  map: any;
  mapOptions: any;


  constructor(
    public zone: NgZone,
    public geolocation: Geolocation,
    public fireStore: AngularFirestore,
    public afAuth: AngularFireAuth,
    private modalCtrl:ModalController,
    private alertController:AlertController
  ) {


  }

  ngOnInit(){
    console.log("### TAB 2 ENTERED ###")
    this.getUserPosition();
  }

  getUserPosition(){
    var options = {
      enableHighAccuracy: true,
      timeout: 30000,
      maximumAge: 0
    };


    this.geolocation.getCurrentPosition(options).then((position) =>  {
      if(position){

        this.location.lat = position.coords.latitude;
        this.location.lng = position.coords.longitude;

        console.log("Postion Found... User at " + position.coords.latitude + ", " + position.coords.longitude);

        this.addMap();
      }else{
        this.mapFail = true;
      }
    });
  }


  addMap(){

    console.log('Generating map...')

    this.mapFail = false;

    this.mapOptions = {
        center: this.location,
        zoom: 12,
        mapTypeControl: false,
        zoomControl: false,
        rotateControl: false,
        scaleControl: false,
        disableDefaultUI: true,
        streetViewControl: false,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, this.mapOptions);

    this.generateMyLocationPin();

  }

  generateMyLocationPin(){

    this.markerOptions.position = this.location;
    this.markerOptions.map = this.map;
    this.markerOptions.title = 'My Location';
    this.marker = new google.maps.Marker(this.markerOptions);


    this.generateFishStoreIcons();
  }

  generateFishStoreIcons(){

    this.fireStore.collection('Shops').valueChanges().subscribe(
    values =>{
      console.log("STORES:")
      console.log(values)

      values.forEach(eachObj => {

        var latLng = {
          lat: Number(eachObj['lat']),
          lng: Number(eachObj['lng'])
        }

        console.log('Adding marker @ ' + latLng.lat + ', ' + latLng.lng);

        var marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: latLng,
          icon: 'assets/shopPin.png'
        });

        google.maps.event.addListener(marker, 'click', () => {
          this.showDetail(eachObj);
        });

        latLng = {lat: 0, lng: 0};
      });
    });
  }


  async presentAlert(eachObj) {
    const alert = await this.alertController.create({
      header: eachObj['name'],
      subHeader: eachObj['address'],
      buttons: ['OK']
    });

    await alert.present();
  }


  activateNewsMode(){
    this.newsMode = true;
  }

  deactivateNewsMode(){
    this.newsMode = false;

    this.getUserPosition();
  }

  async showDetail(eachObj){
    const showDetailModal = await this.modalCtrl.create({
     component: ShopDetailModelPage,
     componentProps: { shop: eachObj }
   });

   return await showDetailModal.present();
  }

  async addStore(){
    const addStorModal = await this.modalCtrl.create({
     component: AddShopModalPage
   });

   return await addStorModal.present();
  }
}
