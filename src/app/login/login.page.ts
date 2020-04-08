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
  }

  async dismissLoader() {
    return await this.loadingController.dismiss().then(() => console.log('dismissed'));
  }

  facebookLogin(){
    this.presentLoading();

    console.log(this.plt.url());

    if (this.plt.url().includes('pondtheapp.com')  || this.plt.url().includes('localhost:8100')) {
      this.authService.loginWithLegacyFacebook().then(res=>{
        this.successfulLogin(res)
      }).catch(err=>{
        this.loginFailure(err)
      })
    }else{
      this.authService.loginWithFacebook().then(res=>{
        console.log("SUCCESS");
        console.log(res);
      }).catch(err=>{
        this.loginFailure(err)
      })
    }
  }

  googleLogin(){
    this.presentLoading();
    //console.log(this.plt);

    if(this.plt.url().includes('pondtheapp.com') || this.plt.url().includes('localhost:8100')){
      this.authService.loginWithLegacyGoogle().then(res=>{
        this.successfulLogin(res);
      }).catch(err=>{
        this.loginFailure(err)
      })
    }else{
      this.authService.loginWithGoogle().then(res=>{
        this.successfulLogin(res);
      }).catch(err=>{
        this.loginFailure(err)
      })
    }

  }


  successfulLogin(res){
    console.log(res);

    setTimeout(() => {
      if(this.loading){ this.dismissLoader() }
      this.router.navigateByUrl('/tabs/search');
    }, 500);

  }

  loginFailure(error){
    alert(error);

    setTimeout(() => {
      if(this.loading){ this.dismissLoader() }
    }, 500);
  }

  goToSpecies(){
    setTimeout(() => {
      if(this.loading){ this.dismissLoader() }
      this.router.navigateByUrl('/tabs/search');
    }, 500);
  }

  // Temp solution - route user in without authentication.
  tempLogin(){
    this.router.navigateByUrl('/tabs/search');
  }

}
