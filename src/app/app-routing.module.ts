import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'fish-detail/:id', loadChildren: './fish-detail/fish-detail.module#FishDetailPageModule' },
  { path: 'tank-detail/:tankname', loadChildren: './tank-detail/tank-detail.module#TankDetailPageModule' },
  { path: 'add-shop-modal', loadChildren: './add-shop-modal/add-shop-modal.module#AddShopModalPageModule' },
  { path: 'shop-detail-model', loadChildren: './shop-detail-model/shop-detail-model.module#ShopDetailModelPageModule' }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
