import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Stat {
  value: string;
  label: string;
  trend: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {
  // Animated ticker stats - more impressive numbers
  tickerStats = [
    { value: '500+', label: 'Startups Analyzed', highlight: '+50 last month' },
    { value: '15+', label: 'Active Incubators & Investors', highlight: 'Growing' },
    { value: '10,000+', label: 'AI Insights Generated', highlight: 'Real-time' },
    { value: '50+', label: 'Portfolio Companies', highlight: 'Active' },
    { value: '₹2000Cr+', label: 'Portfolio Valuation', highlight: 'Tracked' }
  ];

  stats: Stat[] = [
    { value: '500+', label: 'Startups', trend: '+50 this month' },
    { value: '15+', label: 'Institutions', trend: 'Active' },
    { value: '10K+', label: 'AI Insights', trend: 'Real-time' },
    { value: '100%', label: 'Free to Start', trend: 'Always' }
  ];

  // Search categories like YNOS
  searchCategories = [
    { id: 'startups', label: 'Startups', active: true },
    { id: 'incubators', label: 'Incubators', active: false },
    { id: 'investors', label: 'Investors', active: false },
    { id: 'schemes', label: 'Govt. Schemes', active: false }
  ];

  searchQuery = '';
  activeCategory = 'startups';

  features: Feature[] = [
    {
      icon: '🎯',
      title: 'AI-Powered Scoring',
      description: 'Intelligent Investment Readiness and Market Potential scores powered by advanced AI',
      link: '/auth'
    },
    {
      icon: '📊',
      title: 'Portfolio Analytics',
      description: 'Real-time dashboards with insights on your entire startup portfolio',
      link: '/auth'
    },
    {
      icon: '⚖️',
      title: 'Startup Comparison',
      description: 'Compare up to 4 startups side-by-side with transparent scoring breakdowns',
      link: '/auth'
    },
    {
      icon: '💰',
      title: 'Valuation Tools',
      description: 'AI-driven valuation estimates and market sizing calculators',
      link: '/auth'
    },
    {
      icon: '🏛️',
      title: 'Government Schemes',
      description: 'Discover funding schemes and support programs for your startups',
      link: '/auth'
    },
    {
      icon: '📥',
      title: 'Export & Reports',
      description: 'Generate professional reports and export data in multiple formats',
      link: '/auth'
    }
  ];

  useCases = [
    {
      title: 'For Incubators',
      description: 'Manage your portfolio, track progress, and identify high-potential startups',
      benefits: ['Portfolio tracking', 'AI scoring', 'Progress monitoring', 'Batch analytics']
    },
    {
      title: 'For Investors',
      description: 'Screen startups efficiently with AI-powered insights and transparent scoring',
      benefits: ['Smart screening', 'Risk assessment', 'Comparison tools', 'Valuation estimates']
    },
    {
      title: 'For Startup Founders',
      description: 'Understand your scores, get actionable insights, and improve your metrics',
      benefits: ['Score transparency', 'Action plans', 'Market intel', 'Scheme matching']
    }
  ];

  testimonials = [
    {
      quote: 'Portfolio IQ transformed how we manage our incubated startups. The AI insights are game-changing.',
      author: 'Innovation Director',
      organization: 'Tech Incubator'
    },
    {
      quote: 'The scoring transparency helps our startups understand exactly what they need to improve.',
      author: 'Program Manager',
      organization: 'University Accelerator'
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Check if user is already logged in
    const session = sessionStorage.getItem('piq_session');
    const superAdmin = sessionStorage.getItem('piq_super_admin');
    
    if (session || superAdmin) {
      // Already logged in, redirect to dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToAuth(): void {
    this.router.navigate(['/auth']);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  selectCategory(categoryId: string): void {
    this.searchCategories.forEach(cat => cat.active = cat.id === categoryId);
    this.activeCategory = categoryId;
  }

  performSearch(): void {
    // For now, redirect to auth - later can show preview results
    if (this.searchQuery.trim()) {
      this.navigateToAuth();
    }
  }
}
