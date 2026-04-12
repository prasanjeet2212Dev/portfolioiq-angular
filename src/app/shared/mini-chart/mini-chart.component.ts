import { Component, Input, AfterViewInit, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-mini-chart',
  templateUrl: './mini-chart.component.html',
  styleUrls: ['./mini-chart.component.css']
})
export class MiniChartComponent implements AfterViewInit {
  @Input() data: number[] = [];
  @Input() color: string = '#667eea';
  @Input() height: number = 40;
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit() {
    this.drawChart();
  }

  ngOnChanges() {
    if (this.canvasRef) {
      this.drawChart();
    }
  }

  private drawChart() {
    if (!this.data || this.data.length === 0) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Calculate points
    const max = Math.max(...this.data);
    const min = Math.min(...this.data);
    const range = max - min || 1;
    
    const points: { x: number; y: number }[] = this.data.map((value, index) => ({
      x: (index / (this.data.length - 1)) * width,
      y: height - ((value - min) / range) * (height - 10) - 5
    }));

    // Draw line
    ctx.beginPath();
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.stroke();

    // Draw area under line
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, this.color + '40');
    gradient.addColorStop(1, this.color + '00');
    ctx.fillStyle = gradient;
    ctx.fill();
  }
}
