import { Component } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-select-tank-substrate',
  templateUrl: './select-tank-substrate.page.html',
  styleUrls: ['./select-tank-substrate.page.scss'],
})
export class SelectTankSubstratePage {

  substrates: Array<object> = new Array<object>(
    {"name": "Coral sand", "value": "coral_sand"},
    {"name": "River sand", "value": "river_sand"},
    {"name": "Quartz", "value": "quartz"},
    {"name": "Laterite", "value": "laterite"},
    {"name": "Large stones", "value": "large_stones"},
    {"name": "Medium stones", "value": "medium_stones"},
    {"name": "Micro stones", "value": "micro_stones"},
    {"name": "Other", "value": "other"}
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
