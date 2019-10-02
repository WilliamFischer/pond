import { Component, OnInit } from '@angular/core';
import { LoadingController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';

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
    public plt: Platform
  ) { }

  ngOnInit() {
  }

  async presentLoading() {
    this.loading = await this.loadingController.create({
      message: 'Logging you in...',
      duration: 2000
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
        this.router.navigateByUrl('/tabs');
      }).catch(err=>{
        alert(err)
      })
    }else{
      this.authService.loginWithLegacyFacebook().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
      }).catch(err=>{
        alert(err)
      })
    }


  }

  googleLogin(){
    this.presentLoading();

    if (!this.plt.is('mobileweb') && (this.plt.is('android') || this.plt.is('ios'))) {
      this.authService.loginWithGoogle().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
        this.router.navigateByUrl('/tabs');
      }).catch(err=>{
        alert(err)
      })
    }else{
      this.authService.loginWithLegacyGoogle().then(res=>{
        console.log("SUCCESS");
        this.loading.dismiss();
      }).catch(err=>{
        alert(err)
      })
    }

  }

  // Temp solution - route user in without authentication.
  tempLogin(){
    this.router.navigateByUrl('/tabs');
  }

}
