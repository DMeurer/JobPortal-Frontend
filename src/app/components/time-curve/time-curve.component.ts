import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle, ApexPlotOptions, ApexDataLabels, ApexLegend, ApexTooltip } from 'ng-apexcharts';
import { ApiService, JobStatistics, CompanyStatistics } from '../../services/api.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
  tooltip: ApexTooltip;
  colors: string[];
};

@Component({
  selector: 'app-time-curve',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './time-curve.component.html',
  styleUrls: ['./time-curve.component.css']
})
export class TimeCurveComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  loading = true;
  error: string | null = null;

  companies: CompanyStatistics[] = [];
  selectedCompany: string = '';

  chartOptions: Partial<ChartOptions> | null = null;

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
        this.companies = data.companies;

        if (this.companies.length > 0) {
          const randomIndex = Math.floor(Math.random() * this.companies.length);
          this.selectedCompany = this.companies[randomIndex].company_name;
          this.updateChart();
        }

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

  onCompanyChange(): void {
    this.updateChart();
  }

  updateChart(): void {
    const company = this.companies.find(c => c.company_name === this.selectedCompany);

    if (!company) {
      return;
    }

    const sortedDates = [...company.dates].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const categories = sortedDates.map(stat => {
      return new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const existingJobsData = sortedDates.map(stat => {
      return stat.open_positions - stat.newly_added;
    });

    const newJobsData = sortedDates.map(stat => stat.newly_added);

    const removedJobsData = sortedDates.map(stat => -stat.removed);

    this.chartOptions = {
      series: [
        {
          name: 'Removed Jobs',
          data: removedJobsData
        },
        {
          name: 'Existing Jobs',
          data: existingJobsData
        },
        {
          name: 'New Jobs',
          data: newJobsData
        }
      ],
      chart: {
        type: 'bar',
        height: 450,
        stacked: true,
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
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '60%'
        }
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories: categories,
        title: {
          text: 'Date'
        }
      },
      yaxis: {
        title: {
          text: 'Number of Jobs'
        }
      },
      title: {
        text: `Job Statistics - ${this.selectedCompany}`,
        align: 'left',
        style: {
          fontSize: '20px',
          fontWeight: 'bold'
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right'
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        y: {
          formatter: (value: number) => {
            return Math.abs(value) + ' jobs';
          }
        }
      },
      colors: ['#F44336', '#2196F3', '#4CAF50']
    };

    this.cdr.detectChanges();
  }

  refresh(): void {
    this.loadStatistics();
  }
}
