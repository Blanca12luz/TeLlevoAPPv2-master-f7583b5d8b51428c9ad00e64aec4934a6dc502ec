import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SolicitarViajePage } from './solicitar-viaje.page';

const routes: Routes = [
  {
    path: '',
    component: SolicitarViajePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SolicitarViajePageRoutingModule {}
