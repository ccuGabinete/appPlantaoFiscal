import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { DadosComponent } from './dados/dados.component';
import { HomeComponent } from './home/home.component';
import { AutoComponent } from './auto/auto.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dados',
    component: DadosComponent
  },
  {
    path: 'auto',
    component: AutoComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
