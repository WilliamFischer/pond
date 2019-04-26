import { Component } from '@angular/core';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {

  imgMode:boolean = false;
  infoMode:boolean = false;
  rules: boolean;

  constructor(){}

  // Image slider simple master switch
  triggrImgSlider(){
    if(this.imgMode){
      this.imgMode = false;
    }else{
      this.imgMode = true;
    }
  }

  // Rule mode simple master switch
  ruleMode(){
    if(this.rules){
      this.rules = false;
    }else{
      this.rules = true;
    }

  }

  triggrInfoMode(){
    this.infoMode = true;
  }

  untriggrInfoMode(){
    this.infoMode = false;
    this.imgMode = false;
  }
  
}
