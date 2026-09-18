'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { EditableTextProps } from './EditableText.types';
import { DEFAULT_DEBOUNCE_MS } from './EditableText.constants';
import { InvisibleInput } from './EditableText.styles';

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  onChange,
  placeholder = '',
  debounceMs = DEFAULT_DEBOUNCE_MS,
  className,
  style,
  title,
  disabled = false,
  autoFocus = false,
  onFocus,
  onBlur,
  'aria-label': ariaLabel,
}) => {
  const [draft, setDraft] = useState<string>(value);
  const isFocusedRef = useRef<boolean>(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDraftRef = useRef<string>(value);

  latestDraftRef.current = draft;

  // Sync with external value changes when not actively focused
  useEffect(() => {
    if (!isFocusedRef.current) {
      setDraft(value);
      latestDraftRef.current = value;
    }
  }, [value]);

  const flushSave = useCallback(
    (valToSave: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      onSave(valToSave);
    },
    [onSave]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextVal = e.target.value;
    setDraft(nextVal);
    onChange?.(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      flushSave(nextVal);
    }, debounceMs);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = true;
    onFocus?.();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    isFocusedRef.current = false;
    flushSave(latestDraftRef.current);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setDraft(value);
      latestDraftRef.current = value;
      e.currentTarget.blur();
    }
  };

  // Cleanup on unmount: flush any pending save
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        onSave(latestDraftRef.current);
      }
    };
  }, [onSave]);

  return (
    <InvisibleInput
      type="text"
      value={draft}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      style={style}
      title={title}
      disabled={disabled}
      autoFocus={autoFocus}
      aria-label={ariaLabel || placeholder || 'Editable text'}
      onClick={(e) => e.stopPropagation()}
    />
  );
};
