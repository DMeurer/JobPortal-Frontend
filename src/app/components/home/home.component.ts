import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle, ApexStroke, ApexLegend, ApexTooltip, ApexMarkers } from 'ng-apexcharts';
import { ApiService, JobStatistics } from '../../services/api.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  stroke: ApexStroke;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  markers: ApexMarkers;
  colors: string[];
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NgApexchartsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  @ViewChild('totalChart') totalChart!: ChartComponent;
  @ViewChild('companiesChart') companiesChart!: ChartComponent;

  loading = true;
  error: string | null = null;
  lastUpdated: Date | null = null;

  // Chart options for total sum chart
  totalChartOptions: Partial<ChartOptions> | null = null;

  // Chart options for individual companies chart
  companiesChartOptions: Partial<ChartOptions> | null = null;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getJobStatistics().subscribe({
      next: (data: JobStatistics) => {
        this.processStatistics(data);
        this.lastUpdated = new Date();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        this.error = error.status === 401
          ? 'Authentication required. Please set your API key in Settings.'
          : 'Failed to load statistics. Please check your API configuration.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  processStatistics(data: JobStatistics): void {
    try {
      // Get all unique dates across all companies
      const allDates = new Set<string>();
      data.companies.forEach(company => {
        company.dates.forEach(stat => {
          allDates.add(stat.date);
        });
      });

      // Sort dates
      const sortedDates = Array.from(allDates).sort((a, b) => {
        return new Date(a).getTime() - new Date(b).getTime();
      });

      // Prepare data for individual companies chart
      const companiesSeries: ApexAxisChartSeries = data.companies.map(company => {
        // Create a map for quick lookup
        const dateMap = new Map<string, number>();
        company.dates.forEach(stat => {
          dateMap.set(stat.date, stat.open_positions);
        });

        // Fill data for all dates (use 0 if date doesn't exist for this company)
        const seriesData = sortedDates.map(date => dateMap.get(date) || 0);

        return {
          name: company.company_name,
          data: seriesData
        };
      });

      // Prepare data for total sum chart
      const totalData = sortedDates.map(date => {
        let sum = 0;
        data.companies.forEach(company => {
          const stat = company.dates.find(d => d.date === date);
          if (stat) {
            sum += stat.open_positions;
          }
        });
        return sum;
      });

      const totalSeries: ApexAxisChartSeries = [{
        name: 'Total Open Positions',
        data: totalData
      }];

      // Format dates for display
      const formattedDates = sortedDates.map(date => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      });

      // Create charts
      this.createTotalChart(formattedDates, totalSeries);
      this.createCompaniesChart(formattedDates, companiesSeries);
    } catch (error) {
      console.error('Error processing statistics:', error);
      this.error = 'Failed to process statistics data';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  createTotalChart(categories: string[], series: ApexAxisChartSeries): void {
    this.totalChartOptions = {
      series: series,
      chart: {
        type: 'line',
        height: 400,
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      title: {
        text: 'Total Open Positions - All Companies',
        align: 'left',
        style: {
          fontSize: '20px',
          fontWeight: 'bold'
        }
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Date'
        }
      },
      yaxis: {
        title: {
          text: 'Number of Positions'
        },
        min: 0
      },
      tooltip: {
        enabled: true,
        y: {
          formatter: (value: number) => {
            return value + ' positions';
          }
        }
      },
      markers: {
        size: 4,
        hover: {
          size: 6
        }
      },
      colors: ['#008FFB'],
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right'
      }
    };
  }

  createCompaniesChart(categories: string[], series: ApexAxisChartSeries): void {
    this.companiesChartOptions = {
      series: series,
      chart: {
        type: 'line',
        height: 500,
        zoom: {
          enabled: true,
          type: 'x',
          autoScaleYaxis: true
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      title: {
        text: 'Open Positions by Company',
        align: 'left',
        style: {
          fontSize: '20px',
          fontWeight: 'bold'
        }
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Date'
        }
      },
      yaxis: {
        title: {
          text: 'Number of Positions'
        },
        min: 0
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) => {
            return value + ' positions';
          }
        }
      },
      markers: {
        size: 3,
        hover: {
          size: 5
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        floating: false,
        fontSize: '12px'
      },
      colors: ['#008FFB', '#00E396', '#FEB019', '#FF4560', '#775DD0', '#546E7A', '#26a69a', '#D10CE8']
    };
  }

  refresh(): void {
    this.loadStatistics();
  }
}
