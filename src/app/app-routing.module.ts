import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './features/auth/auth.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StartupDetailComponent } from './features/startup-detail/startup-detail.component';
import { AddStartupComponent } from './features/add-startup/add-startup.component';
import { ValuationComponent } from './features/valuation/valuation.component';
import { GovtSchemesComponent } from './features/govt-schemes/govt-schemes.component';
import { AdminComponent } from './features/admin/admin.component';
import { ShowcaseComponent } from './features/showcase/showcase.component';
import { AllStartupsComponent } from './features/all-startups/all-startups.component';
import { MarketSizingComponent } from './features/market-sizing/market-sizing.component';
import { ComparisonComponent } from './features/comparison/comparison.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'showcase', component: ShowcaseComponent },
      { path: 'all-startups', component: AllStartupsComponent },
      { path: 'comparison', component: ComparisonComponent },
      { path: 'market-sizing', component: MarketSizingComponent },
      { path: 'valuation', component: ValuationComponent },
      { path: 'govt-schemes', component: GovtSchemesComponent },
      { path: 'admin', component: AdminComponent },
      { path: 'add-startup', component: AddStartupComponent },
      { path: 'startup/:id', component: StartupDetailComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
