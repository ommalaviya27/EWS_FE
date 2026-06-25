import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button, ButtonInputConfig } from '@common';
import { FilterPanelConfig, FilterValues } from './filter-panel.config';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, Button],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
})
export class FilterPanel implements OnChanges {
  @Input() config!: FilterPanelConfig;
  @Input() isOpen = false;
  @Input() activeValues: Record<string, number | string | boolean | null> | null = null;

  fieldValues: Record<string, number | string | boolean | null> = {};

  private wasOpen = false;

  resetConfig: ButtonInputConfig = {
    variant: 'close',
    text: 'Reset Filter',
    cssClass: 'btn-cancle',
    onClick: () => this.resetFilter(),
  };

  applyConfig: ButtonInputConfig = {
    variant: 'apply',
    text: 'Filter',
    cssClass: 'btn-apply',
    onClick: () => this.applyFilter(),
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      const prev = changes['config'].previousValue as FilterPanelConfig | undefined;
      const curr = changes['config'].currentValue as FilterPanelConfig | undefined;
      const prevKeys = prev?.fields?.map((f) => f.key).join(',') ?? '';
      const currKeys = curr?.fields?.map((f) => f.key).join(',') ?? '';
      if (prevKeys !== currKeys) {
        this.initFieldValues();
      }
    }

    if (changes['isOpen']) {
      const opening = this.isOpen && !this.wasOpen;
      this.wasOpen = this.isOpen;
      if (opening) {
        this.initFieldValues(false);
      }
    }
  }

  private initFieldValues(reset = false): void {
    if (!this.config?.fields) return;
    const source = reset ? null : this.activeValues ?? null;
    const next: Record<string, number | string | boolean | null> = {};

    for (const field of this.config.fields) {
      if (field.type === 'select') {
        const raw = source?.[field.key] ?? field.defaultValue ?? '';
        next[field.key] = raw === true ? 'true' : raw === false ? 'false' : raw;
      } else {
        next[field.key] = source?.[field.key] ?? field.defaultValue ?? '';
      }
    }
    this.fieldValues = next;
  }

  applyFilter(): void {
    const values: FilterValues = {};

    for (const field of this.config.fields) {
      const raw = this.fieldValues[field.key];
      if (raw === '' || raw === null || raw === undefined) {
        values[field.key] = null;
      } else if (raw === 'true') {
        values[field.key] = true;
      } else if (raw === 'false') {
        values[field.key] = false;
      } else {
        values[field.key] = raw;
      }
    }

    this.config.onFilter(values);
  }

  resetFilter(): void {
    this.initFieldValues(true);
    this.config.onCancel();
  }

  reset(): void {
    this.initFieldValues(true);
  }
}