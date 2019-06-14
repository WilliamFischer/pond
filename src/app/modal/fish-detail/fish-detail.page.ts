import { Component, OnInit, Input } from '@angular/core';
import { NavController, NavParams, ModalController } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-fish-detail',
  templateUrl: './fish-detail.page.html',
  styleUrls: ['./fish-detail.page.scss'],
})
export class FishDetailPage implements OnInit {

  // _comm_name
  // quantity
  // sci_name
  // spec_code
  fishObj: any;

  dataToDisplay: any;

  constructor(public navCtrl: NavController, public fireStore: AngularFirestore, public navParams: NavParams, public modalCtrl: ModalController) {
    this.fishObj = this.navParams.get('fish');
    console.log(this.fishObj);
    this.getFishData(this.fishObj['spec_code']);
  }

  getFishData(specCode) {
    this.fireStore.doc("Species/" + specCode).get().toPromise().then(data => {
      if(data.exists) {
        this.dataToDisplay = data.data();
        console.log(this.dataToDisplay);
      } else {
        this.modalCtrl.dismiss();
      }
    });
  }

  ngOnInit() {

  }

  closeModal() {
    this.modalCtrl.dismiss();
  }

}
