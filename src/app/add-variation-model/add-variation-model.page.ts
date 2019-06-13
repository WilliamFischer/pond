import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { AngularFirestore } from 'angularfire2/firestore';

@Component({
  selector: 'app-add-variation-model',
  templateUrl: './add-variation-model.page.html',
  styleUrls: ['./add-variation-model.page.scss'],
})
export class AddVariationModelPage implements OnInit {

  variation = {
    img: 'https://i.pinimg.com/236x/73/74/f1/7374f12c864fca382f5bd51fe328e865--red-fish-fish-fish.jpg',
    name: '',
    comments: '',
  };
  returnedSpecies: any;

  constructor(params: NavParams, private modalCtrl: ModalController, public fireStore: AngularFirestore) {
    this.returnedSpecies = params.get('species');
    console.log(this.returnedSpecies);
  }

  ngOnInit() {}

  goDown(){
    this.modalCtrl.dismiss();
  }

  saveVariation(){
    var variationCode = Math.floor(Math.random()*90000) + 10000;;
    let variationAddress = this.fireStore.doc<any>('Species/' + this.returnedSpecies['specCode'] + '/Variations/' + variationCode);

    variationAddress.set({
      name: this.variation.name,
      img: this.variation.img,
      comments: this.variation.comments,
      varCode: variationCode
    });

    alert("Variation Added Succesfully!")
    this.modalCtrl.dismiss();
  }

}
