export interface FilterOption {
  value: number | string | boolean;
  label: string;
}

export interface FilterFieldConfig {
  key: string;
  label: string | null;
  type:
    | 'select'
    | 'text'
    | 'date'
    | 'time'
    | 'text-with-suffix';

  options?: FilterOption[];
  placeholder?: string;
  suffix?: string;
  icon?: string;
  defaultValue?: number | string | boolean | null;
}

export type FilterValues = Record<string, number | string | boolean | null>;

export interface FilterPanelConfig {
  title?: string;
  fields: FilterFieldConfig[];
  onFilter: (values: FilterValues) => void;
  onCancel: () => void;
}