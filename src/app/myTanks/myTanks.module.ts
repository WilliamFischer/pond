import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { myTanksPage } from './myTanks.page';

import { OrderModule } from 'ngx-order-pipe';


@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    OrderModule,
    RouterModule.forChild([{ path: '', component: myTanksPage }])
  ],
  declarations: [myTanksPage]
})
export class MyTanksPageModule {}
