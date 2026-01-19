import { Component, OnInit, ViewChild, ChangeDetectorRef, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule, ChartComponent, ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis, ApexTitleSubtitle, ApexPlotOptions, ApexDataLabels, ApexLegend, ApexTooltip, ApexTheme, ApexGrid } from 'ng-apexcharts';
import { ApiService, JobStatistics, CompanyStatistics, JobSearchResult, DateStatistics } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';

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
  theme: ApexTheme;
  grid: ApexGrid;
};

export type JobFilterType = 'all' | 'new' | 'removed' | 'existing';

@Component({
  selector: 'app-time-curve',
  standalone: true,
  imports: [CommonModule, FormsModule, NgApexchartsModule],
  templateUrl: './time-curve.component.html',
  styleUrls: ['./time-curve.component.css']
})
export class TimeCurveComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  private themeService = inject(ThemeService);
  private apiService = inject(ApiService);
  private cdr = inject(ChangeDetectorRef);

  loading = true;
  error: string | null = null;

  companies: CompanyStatistics[] = [];
  selectedCompany: string = '';

  chartOptions: Partial<ChartOptions> | null = null;

  // Job list properties
  jobs: JobSearchResult[] = [];
  jobsLoading = false;
  jobsError: string | null = null;
  totalJobs = 0;
  currentPage = 0;
  pageSize = 20;
  pageSizeOptions = [20, 50, 100];

  // Filter state from chart interaction
  selectedDate: string | null = null;
  selectedFilterType: JobFilterType = 'all';
  sortedDates: DateStatistics[] = [];

  constructor() {
    // React to theme changes
    effect(() => {
      const isDark = this.themeService.isDark();
      if (this.selectedCompany && this.sortedDates.length > 0) {
        this.updateChart();
      }
    });
  }

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

  private getChartThemeOptions() {
    const isDark = this.themeService.isDark();
    return {
      background: isDark ? '#282828' : '#faf8f5',
      foreColor: isDark ? '#b0b0b0' : '#5a5a5a',
      gridColor: isDark ? '#404040' : '#d5cfc5',
      titleColor: isDark ? '#e8e8e8' : '#2d2d2d',
      labelColor: isDark ? '#b0b0b0' : '#5a5a5a',
      tooltipTheme: isDark ? 'dark' as const : 'light' as const,
      mode: isDark ? 'dark' as const : 'light' as const
    };
  }

  updateChart(): void {
    const company = this.companies.find(c => c.company_name === this.selectedCompany);

    if (!company) {
      return;
    }

    this.sortedDates = [...company.dates].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    const categories = this.sortedDates.map(stat => {
      return new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const existingJobsData = this.sortedDates.map(stat => {
      return stat.open_positions - stat.newly_added;
    });

    const newJobsData = this.sortedDates.map(stat => stat.newly_added);

    const removedJobsData = this.sortedDates.map(stat => -stat.removed);

    const self = this;
    const theme = this.getChartThemeOptions();

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
        background: theme.background,
        foreColor: theme.foreColor,
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
        },
        events: {
          dataPointSelection: function(event: any, chartContext: any, config: any) {
            const seriesIndex = config.seriesIndex;
            const dataPointIndex = config.dataPointIndex;
            self.onChartClick(seriesIndex, dataPointIndex);
          }
        }
      },
      theme: {
        mode: theme.mode
      },
      grid: {
        borderColor: theme.gridColor,
        strokeDashArray: 3
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
          text: 'Date',
          style: {
            color: theme.labelColor
          }
        },
        labels: {
          style: {
            colors: theme.labelColor
          }
        },
        axisBorder: {
          color: theme.gridColor
        },
        axisTicks: {
          color: theme.gridColor
        }
      },
      yaxis: {
        title: {
          text: 'Number of Jobs',
          style: {
            color: theme.labelColor
          }
        },
        labels: {
          style: {
            colors: theme.labelColor
          }
        }
      },
      title: {
        text: `Job Statistics - ${this.selectedCompany}`,
        align: 'left',
        style: {
          fontSize: '20px',
          fontWeight: 'bold',
          color: theme.titleColor
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'right',
        labels: {
          colors: theme.labelColor
        }
      },
      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
        theme: theme.tooltipTheme,
        y: {
          formatter: (value: number) => {
            return Math.abs(value) + ' jobs';
          }
        }
      },
      colors: ['#F44336', '#2196F3', '#4CAF50']
    };

    // Reset filters and load all jobs for this company
    this.selectedDate = null;
    this.selectedFilterType = 'all';
    this.currentPage = 0;
    this.loadJobs();

    this.cdr.detectChanges();
  }

  onChartClick(seriesIndex: number, dataPointIndex: number): void {
    const dateData = this.sortedDates[dataPointIndex];
    if (!dateData) return;

    this.selectedDate = dateData.date;

    // Map series index to filter type
    // 0 = Removed, 1 = Existing, 2 = New
    switch (seriesIndex) {
      case 0:
        this.selectedFilterType = 'removed';
        break;
      case 1:
        this.selectedFilterType = 'existing';
        break;
      case 2:
        this.selectedFilterType = 'new';
        break;
      default:
        this.selectedFilterType = 'all';
    }

    this.currentPage = 0;
    this.loadJobs();
    this.cdr.detectChanges();
  }

  clearFilter(): void {
    this.selectedDate = null;
    this.selectedFilterType = 'all';
    this.currentPage = 0;
    this.loadJobs();
  }

  loadJobs(): void {
    if (!this.selectedCompany) return;

    this.jobsLoading = true;
    this.jobsError = null;

    const params: any = {
      company_name: this.selectedCompany,
      skip: this.currentPage * this.pageSize,
      limit: this.pageSize
    };

    if (this.selectedDate) {
      params.found_on_date = this.selectedDate;

      // Add job_status filter if a specific type is selected
      if (this.selectedFilterType && this.selectedFilterType !== 'all') {
        params.job_status = this.selectedFilterType;
      }
    }

    this.apiService.searchJobs(params).subscribe({
      next: (result) => {
        this.jobs = result.jobs;
        this.totalJobs = result.total;
        this.jobsLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading jobs:', error);
        this.jobsError = 'Failed to load jobs';
        this.jobsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJobs();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.loadJobs();
  }

  get totalPages(): number {
    return Math.ceil(this.totalJobs / this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(0, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getFilterLabel(): string {
    if (!this.selectedDate) return 'All Jobs';

    const dateLabel = new Date(this.selectedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });

    switch (this.selectedFilterType) {
      case 'new':
        return `New Jobs on ${dateLabel}`;
      case 'removed':
        return `Jobs Removed after ${dateLabel}`;
      case 'existing':
        return `Existing Jobs on ${dateLabel}`;
      default:
        return `Jobs on ${dateLabel}`;
    }
  }

  refresh(): void {
    this.loadStatistics();
  }
}
