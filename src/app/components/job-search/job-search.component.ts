import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService, FilterOptions, JobSearchResult, JobSearchParams } from '../../services/api.service';
import { MultiSelectDropdownComponent } from '../shared/multi-select-dropdown/multi-select-dropdown.component';
import { RegexTextInputComponent, TextSearchValue } from '../shared/regex-text-input/regex-text-input.component';

@Component({
  selector: 'app-job-search',
  standalone: true,
  imports: [CommonModule, FormsModule, MultiSelectDropdownComponent, RegexTextInputComponent],
  templateUrl: './job-search.component.html',
  styleUrls: ['./job-search.component.css']
})
export class JobSearchComponent implements OnInit {
  // Filter options from API
  filterOptions: FilterOptions | null = null;
  filterOptionsLoading = true;
  filterOptionsError: string | null = null;

  // Selected filters
  selectedCompanies: string[] = [];
  selectedLevels: string[] = [];
  titleSearch: TextSearchValue = { text: '', isRegex: false };
  functionSearch: TextSearchValue = { text: '', isRegex: false };
  activeOnly = false;

  // Today's date for comparison
  private today = new Date().toISOString().split('T')[0];

  // Results
  jobs: JobSearchResult[] = [];
  jobsLoading = false;
  jobsError: string | null = null;
  totalJobs = 0;

  // Pagination
  currentPage = 0;
  pageSize = 20;
  pageSizeOptions = [20, 50, 100];

  // Track if we should apply URL params after filter options load
  private pendingUrlParams = true;

  constructor(
    private apiService: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadFilterOptions();
  }

  loadFilterOptions(): void {
    this.filterOptionsLoading = true;
    this.filterOptionsError = null;

    this.apiService.getFilterOptions().subscribe({
      next: (options) => {
        this.filterOptions = options;
        // Select all companies by default
        this.selectedCompanies = [...options.companies];
        this.filterOptionsLoading = false;

        // Apply URL params if this is initial load
        if (this.pendingUrlParams) {
          this.applyUrlParams();
          this.pendingUrlParams = false;
        }

        this.searchJobs();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading filter options:', error);
        this.filterOptionsError = error.status === 401
          ? 'Authentication required. Please set your API key in Settings.'
          : 'Failed to load filter options. Please check your API configuration.';
        this.filterOptionsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private applyUrlParams(): void {
    const params = this.route.snapshot.queryParams;

    // Apply companies filter
    if (params['companies']) {
      const companies = params['companies'].split(',');
      // Only use valid companies from the filter options
      if (this.filterOptions) {
        this.selectedCompanies = companies.filter((c: string) =>
          this.filterOptions!.companies.includes(c)
        );
        // If no valid companies, select all
        if (this.selectedCompanies.length === 0) {
          this.selectedCompanies = [...this.filterOptions.companies];
        }
      }
    }

    // Apply levels filter
    if (params['levels']) {
      const levels = params['levels'].split(',');
      if (this.filterOptions) {
        this.selectedLevels = levels.filter((l: string) =>
          this.filterOptions!.levels.includes(l)
        );
      }
    }

    // Apply title search
    if (params['title']) {
      this.titleSearch = {
        text: params['title'],
        isRegex: params['titleRegex'] === '1'
      };
    }

    // Apply function search
    if (params['function']) {
      this.functionSearch = {
        text: params['function'],
        isRegex: params['functionRegex'] === '1'
      };
    }

    // Apply pagination
    if (params['page']) {
      const page = parseInt(params['page'], 10);
      if (!isNaN(page) && page >= 0) {
        this.currentPage = page;
      }
    }

    if (params['pageSize']) {
      const size = parseInt(params['pageSize'], 10);
      if (this.pageSizeOptions.includes(size)) {
        this.pageSize = size;
      }
    }

    // Apply active only filter
    if (params['activeOnly'] === '1') {
      this.activeOnly = true;
    }
  }

  private updateUrl(): void {
    const queryParams: any = {};

    // Add companies if not all selected
    if (this.filterOptions && this.selectedCompanies.length < this.filterOptions.companies.length) {
      if (this.selectedCompanies.length > 0) {
        queryParams.companies = this.selectedCompanies.join(',');
      }
    }

    // Add levels if any selected
    if (this.selectedLevels.length > 0) {
      queryParams.levels = this.selectedLevels.join(',');
    }

    // Add title search
    if (this.titleSearch.text) {
      queryParams.title = this.titleSearch.text;
      if (this.titleSearch.isRegex) {
        queryParams.titleRegex = '1';
      }
    }

    // Add function search
    if (this.functionSearch.text) {
      queryParams.function = this.functionSearch.text;
      if (this.functionSearch.isRegex) {
        queryParams.functionRegex = '1';
      }
    }

    // Add pagination if not default
    if (this.currentPage > 0) {
      queryParams.page = this.currentPage;
    }

    if (this.pageSize !== 20) {
      queryParams.pageSize = this.pageSize;
    }

    // Add active only filter
    if (this.activeOnly) {
      queryParams.activeOnly = '1';
    }

    // Update URL without navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      replaceUrl: true
    });
  }

  onCompaniesChange(companies: string[]): void {
    this.selectedCompanies = companies;
    this.currentPage = 0;
    this.searchJobs();
  }

  onLevelsChange(levels: string[]): void {
    this.selectedLevels = levels;
    this.currentPage = 0;
    this.searchJobs();
  }

  onTitleSearchChange(value: TextSearchValue): void {
    this.titleSearch = value;
    this.currentPage = 0;
    this.searchJobs();
  }

  onFunctionSearchChange(value: TextSearchValue): void {
    this.functionSearch = value;
    this.currentPage = 0;
    this.searchJobs();
  }

  onActiveOnlyChange(): void {
    this.currentPage = 0;
    this.searchJobs();
  }

  isJobActive(job: JobSearchResult): boolean {
    return job.last_seen === this.today;
  }

  searchJobs(): void {
    this.jobsLoading = true;
    this.jobsError = null;

    // Update URL with current filters
    this.updateUrl();

    const params: JobSearchParams = {
      skip: this.currentPage * this.pageSize,
      limit: this.pageSize
    };

    // Add company filter if not all companies are selected
    if (this.filterOptions && this.selectedCompanies.length < this.filterOptions.companies.length) {
      if (this.selectedCompanies.length > 0) {
        params.company_names = this.selectedCompanies;
      }
    }

    // Add level filter if any selected
    if (this.selectedLevels.length > 0) {
      params.levels = this.selectedLevels;
    }

    // Add title search
    if (this.titleSearch.text) {
      if (this.titleSearch.isRegex) {
        params.title_regex = this.titleSearch.text;
      } else {
        params.title_contains = this.titleSearch.text;
      }
    }

    // Add function search
    if (this.functionSearch.text) {
      if (this.functionSearch.isRegex) {
        params.function_regex = this.functionSearch.text;
      } else {
        params.function = this.functionSearch.text;
      }
    }

    // Add active only filter (jobs last seen today)
    if (this.activeOnly) {
      params.found_on_date = 'today';
    }

    this.apiService.searchJobs(params).subscribe({
      next: (result) => {
        this.jobs = result.jobs;
        this.totalJobs = result.total;
        this.jobsLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error searching jobs:', error);
        this.jobsError = 'Failed to search jobs';
        this.jobsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.searchJobs();
  }

  onPageSizeChange(): void {
    this.currentPage = 0;
    this.searchJobs();
  }

  clearFilters(): void {
    if (this.filterOptions) {
      this.selectedCompanies = [...this.filterOptions.companies];
    }
    this.selectedLevels = [];
    this.titleSearch = { text: '', isRegex: false };
    this.functionSearch = { text: '', isRegex: false };
    this.activeOnly = false;
    this.currentPage = 0;
    this.searchJobs();
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

  get hasActiveFilters(): boolean {
    const hasCompanyFilter = this.filterOptions
      ? this.selectedCompanies.length < this.filterOptions.companies.length
      : false;
    return hasCompanyFilter
      || this.selectedLevels.length > 0
      || !!this.titleSearch.text
      || !!this.functionSearch.text
      || this.activeOnly;
  }
}
