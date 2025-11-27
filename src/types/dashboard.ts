export interface FilterState {
  selectedMonth: Date;
  comparisonMonth?: Date | null;
  analysisType?: 'monthly' | 'comparison';
  isComparisonMode?: boolean;
  clinicStatus: string;
  revenueCategory: string;
  operatoriesRange: string;
  clinicName: string;
  city: string;
  zone: string;
  specialty: string;
  doctor: string;
}

export interface ClinicFiltersProps {
  onFiltersChange: (filters: FilterState, isLoading?: boolean) => void;
  className?: string;
  showContextLabels?: boolean;
  contextData?: {
    clinicName?: string;
    city?: string;
    zone?: string;
    specialty?: string;
    doctor?: string;
  };
}
