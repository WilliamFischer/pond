import { Component } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-select-tank-substrate',
  templateUrl: './select-tank-substrate.page.html',
  styleUrls: ['./select-tank-substrate.page.scss'],
})
export class SelectTankSubstratePage {

  substrates: Array<object> = new Array<object>(
    {"name": "Coral sand", "value": "Coral Sand"},
    {"name": "River sand", "value": "River Sand"},
    {"name": "Quartz", "value": "Quartz"},
    {"name": "Laterite", "value": "Laterite"},
    {"name": "Large stones", "value": "Large Stones"},
    {"name": "Medium stones", "value": "Medium Stones"},
    {"name": "Micro stones", "value": "Micro Stones"},
    {"name": "Other", "value": "Other"}
  );

  constructor(public navCtrl: NavController, public modalCtrl: ModalController) { }

  selectSubstrate(index: number) {
    if(index < this.substrates.length){
      console.log(index);
      let selectedCalltype = this.substrates[index]
      this.modalCtrl.dismiss(selectedCalltype);
    }
  }

}
