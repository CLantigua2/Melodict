import React from 'react';

export interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => void;
  onChange?: (currentValue: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  'aria-label'?: string;
}
