import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TextSearchValue {
  text: string;
  isRegex: boolean;
}

@Component({
  selector: 'app-regex-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './regex-text-input.component.html',
  styleUrls: ['./regex-text-input.component.css']
})
export class RegexTextInputComponent {
  @Input() placeholder: string = 'Search...';
  @Input() value: string = '';
  @Input() isRegex: boolean = false;
  @Output() valueChange = new EventEmitter<TextSearchValue>();

  regexError: string | null = null;

  onTextChange(): void {
    this.validateAndEmit();
  }

  toggleRegex(): void {
    this.isRegex = !this.isRegex;
    this.validateAndEmit();
  }

  private validateAndEmit(): void {
    this.regexError = null;
    if (this.isRegex && this.value) {
      try {
        new RegExp(this.value);
      } catch (e) {
        this.regexError = 'Invalid regex pattern';
      }
    }
    this.valueChange.emit({
      text: this.value,
      isRegex: this.isRegex
    });
  }
}
