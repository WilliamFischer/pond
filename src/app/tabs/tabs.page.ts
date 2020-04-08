import { Component, ViewChild } from '@angular/core';

import { ApiProvider } from '../providers/api/api'

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(public apiService: ApiProvider){}

  forceHome(){
    if(window.location.pathname == '/tabs/search'){
      this.apiService.clearSearch();
    }
  }
}
