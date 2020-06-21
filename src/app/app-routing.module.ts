import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { TabsPageModule } from './tabs/tabs.module'

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'admin', loadChildren: './admin/admin.module#AdminPageModule' },
  { path: 'species/:id', loadChildren: './species/species.module#SpeciesPageModule' },
  { path: 'users/:id', loadChildren: './user/user.module#UserPageModule' },
  { path: 'tanks/:id/:id', loadChildren: './tank/tank.module#TankPageModule' },
  { path: 'select-tank-substrate', loadChildren: './modal/select-tank-substrate/select-tank-substrate.module#SelectTankSubstratePageModule' },
  // { path: 'fish-detail/:id', loadChildren: './fish-detail/fish-detail.module#FishDetailPageModule' },
  // { path: 'tank-detail/:tankname', loadChildren: './tank-detail/tank-detail.module#TankDetailPageModule' },
  // { path: 'add-shop-modal', loadChildren: './add-shop-modal/add-shop-modal.module#AddShopModalPageModule' },
  // { path: 'shop-detail-model', loadChildren: './shop-detail-model/shop-detail-model.module#ShopDetailModelPageModule' },
  // { path: 'add-variation-model', loadChildren: './add-variation-model/add-variation-model.module#AddVariationModelPageModule' },
  // { path: 'fish-detail-modal/:id', loadChildren: './modal/fish-detail/fish-detail.module#FishDetailPageModule' },
  // { path: 'mainfishdetail', loadChildren: './mainfishdetail/mainfishdetail.module#MainfishdetailPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
