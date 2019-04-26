import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {
  speciesSelected: boolean;
  species = {
    name: '',
    category: '',
    price: '',
    weight: '',
    desc: '',
    imgurl: ''
  };

  // Access detail page and save selected species
  selectSpecies(name){
    this.speciesSelected = true;
    this.species.name = name;
  }

  // Leave detail page and clear selected species
  unSelectSpecies(){
    this.speciesSelected = false;
    this.species.name = '';
  }
}
