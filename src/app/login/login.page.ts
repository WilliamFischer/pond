import { Component, OnInit } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';

// Providers
import { AuthProvider } from '../providers/auth/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(
    private router: Router,
    public loadingController: LoadingController,
    private authService: AuthProvider
  ) { }

  ngOnInit() {
  }

  // async presentLoading() {
  //   const loading = await this.loadingController.create({
  //     message: 'Logging you in...',
  //     duration: 2000
  //   });
  //   await loading.present();
  //
  //   const { role, data } = await loading.onDidDismiss();
  //
  //   console.log('Loading dismissed!');
  // }

  facebookLogin(){
    // this.presentLoading();

    this.authService.loginWithFacebook().then(res=>{
      console.log("SUCCESS");
      this.router.navigateByUrl('/tabs');
    }).catch(err=>{
      alert(err)
    })
  }

  googleLogin(){
    // this.presentLoading();


    this.authService.loginWithGoogle().then(res=>{
      console.log("SUCCESS");
      this.router.navigateByUrl('/tabs');
    }).catch(err=>{
      alert(err)
    })
  }

  // Temp solution - route user in without authentication.
  tempLogin(){
    this.router.navigateByUrl('/tabs');
  }

}
