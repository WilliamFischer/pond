import { Component, OnInit, Input } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-fish-detail',
  templateUrl: './fish-detail.page.html',
  styleUrls: ['./fish-detail.page.scss'],
})
export class FishDetailPage implements OnInit {

  fishObj: any;
  tankObj: any;

  dataToDisplay: any;
  photosToDisplay: any;

  constructor(public navCtrl: NavController, public fireStore: AngularFirestore, public navParams: NavParams, public modalCtrl: ModalController) {
    this.fishObj = this.navParams.get('fish');
    this.tankObj = this.navParams.get('tank');
    console.log(this.fishObj);
    console.log(this.tankObj);
    this.getFishData(this.fishObj['spec_code']);
  }

  getFishData(specCode) {
    this.fireStore.doc("Species/" + specCode).get().toPromise().then(data => {
      if(data.exists) {
        this.dataToDisplay = data.data();
        this.getPhotos(data.data());
        console.log(this.dataToDisplay);
      } else {
        this.modalCtrl.dismiss();
      }
    });
  }

  getPhotos(species){
    this.fireStore.collection('Species/' + species['specCode'] + '/Pic').valueChanges().subscribe(values => {
      this.photosToDisplay = values;
      console.log(this.photosToDisplay);
    });
  }

  ngOnInit() {

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
