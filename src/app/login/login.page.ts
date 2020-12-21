import { Component, OnInit } from '@angular/core';
import { LoadingController, AlertController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AngularFireAuth } from 'angularfire2/auth';

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
    public alertController: AlertController,
    private authService: AuthProvider,
    public plt: Platform,
    private location: Location,
    public afAuth: AngularFireAuth,
  ) { }

  ngOnInit() {
    this.afAuth.authState.subscribe(auth=>{
      if(auth){
        this.router.navigateByUrl('/tabs/tanks');

        setTimeout(() => {
          this.dismissLoader()
        }, 1500);
      }
    });
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
        this.router.navigateByUrl('/tabs/tanks');
      }).catch(err=>{
        alert(err);

        setTimeout(() => {
          this.dismissLoader()
        }, 1500);
      })
    }else{
      this.authService.loginWithFacebook().then(res=>{
        this.router.navigateByUrl('/tabs/tanks');
      }).catch(err=>{
        alert(err);

        setTimeout(() => {
          this.dismissLoader()
        }, 1500);
      })
    }
  }

  googleLogin(){
    this.presentLoading();
    //console.log(this.plt);

    if(this.plt.url().includes('pondtheapp.com') || this.plt.url().includes('localhost:8100')){
      this.authService.loginWithLegacyGoogle().then(res=>{
        this.router.navigateByUrl('/tabs/tanks');
      }).catch(err=>{
        alert(err);
        if(this.loading){ this.dismissLoader() }
      })
    }else{
      this.authService.loginWithGoogle().then(res=>{
        this.router.navigateByUrl('/tabs/tanks');
      }).catch(err=>{
        alert(err);
        if(this.loading){ this.dismissLoader() }
      })
    }

  }

  goToSpecies(){
    setTimeout(() => {
      if(this.loading){ this.dismissLoader() }
      this.location.back();
    }, 500);
  }

  // Temp solution - route user in without authentication.
  tempLogin(){
    this.router.navigateByUrl('/tabs/search');
  }

  tac(){

  }


  async passwordRegister() {
    const alert = await this.alertController.create({
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Display Name'
        },
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
        },
        {
          name: 'pass',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Back',
          role: 'cancel'
        }, {
          text: 'Ok',
          handler: (data) => {
            this.afAuth.auth.createUserWithEmailAndPassword(data.email, data.pass).then( response => {
              localStorage.setItem('userName', data.name)
              this.router.navigateByUrl('/tabs/tanks');
            }).catch((err) => {
              this.showError(err.message)
            })

          }
        }
      ]
    });

    await alert.present();
  }


  async passwordLogin() {
    const alert = await this.alertController.create({
      inputs: [
        {
          name: 'email',
          type: 'text',
          placeholder: 'Email'
        },
        {
          name: 'pass',
          type: 'password',
          placeholder: 'Password'
        }
      ],
      buttons: [
        {
          text: 'Back',
          role: 'cancel'
        }, {
          text: 'Ok',
          handler: (data) => {
            this.afAuth.auth.signInWithEmailAndPassword(data.email, data.pass).then( response => {
              this.router.navigateByUrl('/tabs/tanks');
            }).catch((err) => {
              this.showError(err.message)
            })

          }
        }
      ]
    });

    await alert.present();
  }

  showError(err){
    alert(err);
  }
}
