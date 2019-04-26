import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-tab5',
  templateUrl: 'tab5.page.html',
  styleUrls: ['tab5.page.scss']
})
export class Tab5Page {

  constructor(private router: Router,
    public afAuth: AngularFireAuth) { }

  // Route the user back to the login page
  //
  logout(){
    console.log('Logging out...')

    this.afAuth.auth.signOut().then(() => {
       this.router.navigateByUrl('/login');
    });
  }
}
