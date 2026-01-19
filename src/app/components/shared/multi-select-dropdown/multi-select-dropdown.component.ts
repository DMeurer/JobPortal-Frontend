import { Component, Input, Output, EventEmitter, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './multi-select-dropdown.component.html',
  styleUrls: ['./multi-select-dropdown.component.css']
})
export class MultiSelectDropdownComponent implements OnInit {
  @Input() options: string[] = [];
  @Input() selectedOptions: string[] = [];
  @Input() placeholder: string = 'Select options';
  @Input() selectAllByDefault: boolean = false;
  @Output() selectionChange = new EventEmitter<string[]>();

  isOpen = false;
  searchText = '';
  filteredOptions: string[] = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.filteredOptions = [...this.options];
    if (this.selectAllByDefault && this.selectedOptions.length === 0) {
      this.selectedOptions = [...this.options];
      this.selectionChange.emit(this.selectedOptions);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchText = '';
      this.filterOptions();
    }
  }

  filterOptions(): void {
    if (!this.searchText) {
      this.filteredOptions = [...this.options];
    } else {
      const search = this.searchText.toLowerCase();
      this.filteredOptions = this.options.filter(opt =>
        opt.toLowerCase().includes(search)
      );
    }
  }

  isSelected(option: string): boolean {
    return this.selectedOptions.includes(option);
  }

  toggleOption(option: string): void {
    const index = this.selectedOptions.indexOf(option);
    if (index > -1) {
      this.selectedOptions = this.selectedOptions.filter(o => o !== option);
    } else {
      this.selectedOptions = [...this.selectedOptions, option];
    }
    this.selectionChange.emit(this.selectedOptions);
  }

  selectAll(): void {
    this.selectedOptions = [...this.options];
    this.selectionChange.emit(this.selectedOptions);
  }

  deselectAll(): void {
    this.selectedOptions = [];
    this.selectionChange.emit(this.selectedOptions);
  }

  get displayText(): string {
    if (this.selectedOptions.length === 0) {
      return this.placeholder;
    }
    if (this.selectedOptions.length === this.options.length) {
      return 'All selected';
    }
    if (this.selectedOptions.length <= 2) {
      return this.selectedOptions.join(', ');
    }
    return `${this.selectedOptions.length} selected`;
  }
}
