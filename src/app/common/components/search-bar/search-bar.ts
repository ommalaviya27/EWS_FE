import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.html',
  styleUrls: ['./search-bar.css'],
})
export class SearchBarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() placeholder = 'Search by name…';
  @Input() debounceMs = 350;
  @Input() value = '';
  @Output() searchChange = new EventEmitter<string>();

  inputValue = '';

  private inputSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.inputSubject
      .pipe(debounceTime(this.debounceMs), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => this.searchChange.emit(term));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && changes['value'].currentValue !== this.inputValue) {
      this.inputValue = changes['value'].currentValue ?? '';
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInput(term: string): void {
    this.inputValue = term;
    this.inputSubject.next(term.trim());
  }

  clearSearch(): void {
    this.inputValue = '';
    this.inputSubject.next('');
  }
}