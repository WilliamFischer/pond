import { Component } from '@angular/core';

import { AngularFirestore } from 'angularfire2/firestore';

import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})
export class Tab4Page {

  speciesSelected: boolean;
  doneLoading: boolean;
  searchQuery: string = '';
  plantSpecies: any = [];

  constructor(
    private http:HttpClient,
    public fireStore: AngularFirestore){

  }

  ngOnInit() {}

  checkAPI($event, autoQuery){
    if(autoQuery.length >= 1){
      var searchQuery = autoQuery;
    }else{
      var searchQuery = $event.srcElement.value;
    }

    this.searchQuery = searchQuery;
    this.speciesSelected = false;
    this.plantSpecies = [];

    if(searchQuery.length > 2){
      console.log('Running API for ' + searchQuery + '...');

      this.plantSearch(searchQuery);

    }else{
      console.log('Query length is too short.')
      this.doneLoading = true;
    }


  }

  displayPlantBase(result, searchQuery){
    var loopValue = result['data']

    console.log(loopValue.length + ' PLANT SPECIES DETECTED ');
    console.log(loopValue)

    loopValue.forEach(eachObj => {

      console.log(eachObj)

      if(eachObj['Symbol']){
        var imgAddress = eachObj['Symbol'] + '_001_shp.jpg'
        this.plantSpecies.push(eachObj);
      }


    });

  }


  plantSearch(searchQuery){

    // TREFLE APP
    //
    //

    // let headers = new ();
    // headers.append('Content-Type', 'application/json');
    // headers.append('authentication', 'QWZRSUQ0a0pHRDJ5djE1Q0crSFpEUT09');
    //
    // let options = new RequestOptions({ headers: headers });
    //
    // this.http.get('http://trefle.io/api/plants?q=' + searchQuery, {
    // headers: new Headers({
    //   'Authorization': 'my-auth-token',
    //   'x-header': 'x-value'
    // }).subscribe(
    // result => {
    //   console.log(result)
    // });


    this.http.get('https://plantsdb.xyz/search?Common_Name=' + searchQuery + '&limit=100').subscribe(
    result => {
      this.displayPlantBase(result, searchQuery)
    },
    error => {
      this.http.get('https://plantsdb.xyz/search?Genus=' + searchQuery + '&limit=100').subscribe(
      result => {
        this.displayPlantBase(result, searchQuery)
      },
      error => {
        this.http.get('https://plantsdb.xyz/search?Species=' + searchQuery + '&limit=100').subscribe(
        result => {
          this.displayPlantBase(result, searchQuery)
        },
        error => {
          this.http.get('https://plantsdb.xyz/search?Family=' + searchQuery + '&limit=100').subscribe(
          result => {
            this.displayPlantBase(result, searchQuery)
          },
          error => {
            console.log("ALL MATCHES FAILED ON NAME, SPECIES, GENUS & FAMILY");
            this.plantSpecies = [];
            this.doneLoading = true;
          });
        });
      });
    });

    
  }
}
