import { Component } from '@angular/core';

import { AngularFirestore } from 'angularfire2/firestore';

import {HttpClient} from "@angular/common/http";
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  speciesSelected: boolean;
  searchQuery: string;
  species = {
    name: '',
    category: '',
    price: '',
    weight: '',
    desc: '',
    imgurl: ''
  };

  constructor(
    private http:HttpClient,
    public fireStore: AngularFirestore){

  }

  ngOnInit() {}

  checkAPI($event){
    var searchQuery = $event.srcElement.value;

    if(searchQuery.length > 2){
      console.log('Running API for ' + searchQuery + '...');
      this.runFishbaseChecker(searchQuery)
    }else{
      console.log('Query length is too short.')
    }


  }

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


  checkSpeciesDatabase(result, searchQuery){
    var lowerQuery = searchQuery.toLowerCase();

    this.fireStore.doc('Species/' + result.data[0].SpecCode).valueChanges().subscribe(
      values => {

        if(values != null){
          if(values['species'] != null) {
            console.log('EXISTS IN DATABASE');
            console.log(result);

            if(values['species'] == lowerQuery || values['name'] == lowerQuery || values['genus'] == lowerQuery){
              console.log('Species not found')
            }else{
              this.addToDatabase(result);
            }

          } else {
            this.addToDatabase(result);
          }
        } else {
          this.addToDatabase(result);
        }

      }
    );

  }

  addToDatabase(result){
    console.log('NEW RESULT! ADDING TO DATABASE...');

    let speciesAddress = this.fireStore.doc<any>('Species/' + result.data[0].SpecCode);

    var commName = '';

    if(result.data[0].FBname){
      commName = result.data[0].FBname
    }else{
      commName = result.data[0].Genus + " " + result.data[0].Species;
    }

    if(result.data[0].Fresh == '-1'){
      speciesAddress.set({
        name: commName.toLowerCase(),
        species: result.data[0].Species.toLowerCase(),
        genus: result.data[0].Genus.toLowerCase(),
        comments: result.data[0].Comments,
        dangerous: result.data[0].Dangerous,
        length: result.data[0].Length,
        genCode: result.data[0].GenCode,
        specCode: result.data[0].SpecCode,
        SpeciesRefNo: result.data[0].SpeciesRefNo,
        vulnerability: result.data[0].Vulnerability
      })
    }else{
      console.log(commName + " is saltwater. Cancelling")
    }


  }



  runFishbaseChecker(searchQuery){
    this.http.get('https://fishbase.ropensci.org/species?FBname=' + searchQuery).subscribe(
      result => {
        // Handle result
        this.checkSpeciesDatabase(result, searchQuery);
      },
      error => {
        this.http.get('https://fishbase.ropensci.org/species?Genus=' + searchQuery).subscribe(
          result => {
            // Handle result
            this.checkSpeciesDatabase(result, searchQuery);
          },
          error => {
            this.http.get('https://fishbase.ropensci.org/species?Species=' + searchQuery).subscribe(
              result => {
                // Handle result
                this.checkSpeciesDatabase(result, searchQuery);
              },
              error => {
                console.log("ALL MATCHES FAILED")
              }
            );
          }
        );
      }
    );
  }

}
