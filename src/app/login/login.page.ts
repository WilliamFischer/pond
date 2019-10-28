import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

// Providers
import { AuthProvider } from '../providers/auth/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loading: any;

  constructor(
    private router: Router,
    public loadingController: LoadingController,
    private authService: AuthProvider,
    public plt: Platform,
    private location: Location
  ) { }

  ngOnInit() {
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Logging you in...'
    });
    await this.loading.present();

    const { role, data } = await this.loading.onDidDismiss();

    console.log('Loading dismissed!');
  }

  facebookLogin(){
    this.presentLoading();
    console.log(this.plt);

    if (!this.plt.is('mobileweb') && (this.plt.is('android') || this.plt.is('ios'))) {
      this.authService.loginWithFacebook().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
        location.reload();
      }).catch(err=>{
        console.log(err)
        this.loading.dismiss();
      })
    }else{
      this.authService.loginWithLegacyFacebook().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
        location.reload();
      }).catch(err=>{
        console.log(err)
        this.loading.dismiss();
      })
    }


  }

  googleLogin(){
    this.presentLoading();
    console.log(this.plt);

    if (!this.plt.is('mobileweb') && (this.plt.is('android') || this.plt.is('ios'))) {
      this.authService.loginWithGoogle().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
        location.reload();
      }).catch(err=>{
        alert(err)
        this.loading.dismiss();
      })
    }else{
      this.authService.loginWithLegacyGoogle().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
        location.reload();
      }).catch(err=>{
        alert(err)
        this.loading.dismiss();
      })
    }

  }

  goToSpecies(){
    this.location.back();
  }

  // Temp solution - route user in without authentication.
  tempLogin(){
    this.router.navigateByUrl('/tabs');
  }

}
