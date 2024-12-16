import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CrearViajesPage } from './crear-viajes.page';

const routes: Routes = [
  {
    path: '',
    component: CrearViajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CrearViajesPageRoutingModule {}
