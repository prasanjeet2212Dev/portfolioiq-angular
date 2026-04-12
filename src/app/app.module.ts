import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthComponent } from './features/auth/auth.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { StartupDetailComponent } from './features/startup-detail/startup-detail.component';
import { AddStartupComponent } from './features/add-startup/add-startup.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { ValuationComponent } from './features/valuation/valuation.component';
import { GovtSchemesComponent } from './features/govt-schemes/govt-schemes.component';
import { AdminComponent } from './features/admin/admin.component';
import { ShowcaseComponent } from './features/showcase/showcase.component';
import { AllStartupsComponent } from './features/all-startups/all-startups.component';
import { MarketSizingComponent } from './features/market-sizing/market-sizing.component';
import { ScoreBreakdownComponent } from './shared/score-breakdown/score-breakdown.component';
import { MiniChartComponent } from './shared/mini-chart/mini-chart.component';
import { ComparisonComponent } from './features/comparison/comparison.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    DashboardComponent,
    StartupDetailComponent,
    AddStartupComponent,
    LayoutComponent,
    ValuationComponent,
    GovtSchemesComponent,
    AdminComponent,
    ShowcaseComponent,
    AllStartupsComponent,
    MarketSizingComponent,
    ScoreBreakdownComponent,
    MiniChartComponent,
    ComparisonComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
