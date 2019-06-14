import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'fish-detail/:id', loadChildren: './fish-detail/fish-detail.module#FishDetailPageModule' },
  { path: 'tank-detail/:tankname', loadChildren: './tank-detail/tank-detail.module#TankDetailPageModule' },
  { path: 'add-shop-modal', loadChildren: './add-shop-modal/add-shop-modal.module#AddShopModalPageModule' },
  { path: 'shop-detail-model', loadChildren: './shop-detail-model/shop-detail-model.module#ShopDetailModelPageModule' },
  { path: 'select-tank-substrate', loadChildren: './modal/select-tank-substrate/select-tank-substrate.module#SelectTankSubstratePageModule' },
  { path: 'add-variation-model', loadChildren: './add-variation-model/add-variation-model.module#AddVariationModelPageModule' },
  { path: 'fish-detail-modal', loadChildren: './modal/fish-detail/fish-detail.module#FishDetailPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
