import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-market-sizing',
  templateUrl: './market-sizing.component.html',
  styleUrls: ['./market-sizing.component.css']
})
export class MarketSizingComponent implements OnInit {
  linkToStartup = 'standalone';
  customerType = 'b2c';
  geography = 'pan-india';
  totalUniverse = '';
  digitallyReachable = '';
  willingToPay = '';
  
  dataSource = 'census';
  revenueModel = 'subscription';
  arpu = '';
  samPercentage = '';
  founderClaimTam = '';
  founderClaimSam = '';

  result: any = null;

  constructor() {}

  ngOnInit() {
  }

  calculate() {
    // Placeholder calculation
    this.result = {
      tam: '4500000',
      sam: '36',
      validation: 'Founder claims are 10× inflated'
    };
  }

  validateWithAI() {
    // Placeholder AI validation
    alert('AI validation would run here');
  }
}
