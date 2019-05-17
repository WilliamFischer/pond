import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { SelectTankSubstratePage } from './select-tank-substrate.page';

const routes: Routes = [
  {
    path: '',
    component: SelectTankSubstratePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [SelectTankSubstratePage]
})
export class SelectTankSubstratePageModule {}
