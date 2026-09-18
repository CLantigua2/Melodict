'use client';

import React from 'react';
import {
  Music,
  ChevronDown,
  Volume2,
  VolumeX,
  Palette,
  Plus,
  Share2,
  Trash2,
  Loader2,
} from 'lucide-react';
import { useScore } from '@/context/ScoreContext';
import { useAppTheme } from '@/theme/ThemeProvider';
import { INSTRUMENT_OPTIONS } from '@/audio/audio.constants';
import { HeaderProps } from './Header.types';
import { THEME_OPTIONS } from './Header.constants';
import {
  HeaderContainer,
  BrandSection,
  LogoBadge,
  BrandTitle,
  MvpBadge,
  ScoreTitleInput,
  MiddleSection,
  SelectWrapper,
  StyledSelect,
  SelectIcon,
  ControlsGroup,
  VolumeControl,
  VolumeSlider,
  ActionButton,
  LoadingIndicator,
} from './Header.styles';

export const Header: React.FC<HeaderProps> = ({ onOpenExportModal }) => {
  const {
    score,
    changeInstrument,
    masterVolume,
    setMasterVolume,
    isInstrumentLoading,
  } = useScore();

  const { themeName, setThemeName } = useAppTheme();

  return (
    <HeaderContainer>
      <BrandSection>
        <LogoBadge>
          <Music size={20} strokeWidth={2.5} />
        </LogoBadge>
        <BrandTitle>
          Melo<span>dict</span>
        </BrandTitle>
        <MvpBadge>MVP</MvpBadge>
      </BrandSection>

      <MiddleSection>
        {/* Virtual Instrument Selector */}
        <SelectWrapper>
          <StyledSelect
            value={score.instrumentId}
            onChange={(e) => changeInstrument(e.target.value as any)}
            title="Select virtual instrument"
          >
            {INSTRUMENT_OPTIONS.map((inst) => (
              <option key={inst.id} value={inst.id}>
                🎹 {inst.name} ({inst.category})
              </option>
            ))}
          </StyledSelect>
          <SelectIcon>
            <ChevronDown size={14} />
          </SelectIcon>
        </SelectWrapper>

        {isInstrumentLoading && (
          <LoadingIndicator>
            <Loader2 size={14} className="animate-spin" />
            <span>Loading sample kit...</span>
          </LoadingIndicator>
        )}
      </MiddleSection>

      <ControlsGroup>
        {/* Live Theme Experimentation */}
        <SelectWrapper>
          <StyledSelect
            value={themeName}
            onChange={(e) => setThemeName(e.target.value)}
            title="Change Theme Palette"
          >
            {THEME_OPTIONS.map((t) => (
              <option key={t.id} value={t.id}>
                🎨 {t.label}
              </option>
            ))}
          </StyledSelect>
          <SelectIcon>
            <Palette size={14} />
          </SelectIcon>
        </SelectWrapper>

        {/* Master Volume */}
        <VolumeControl>
          {masterVolume === 0 ? (
            <VolumeX size={16} onClick={() => setMasterVolume(0.8)} style={{ cursor: 'pointer' }} />
          ) : (
            <Volume2 size={16} onClick={() => setMasterVolume(0)} style={{ cursor: 'pointer' }} />
          )}
          <VolumeSlider
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
            title={`Volume: ${Math.round(masterVolume * 100)}%`}
          />
        </VolumeControl>

        {/* Export / Share */}
        <ActionButton $variant="primary" onClick={onOpenExportModal} title="Export Composition">
          <Share2 size={16} />
          <span>Export</span>
        </ActionButton>
      </ControlsGroup>
    </HeaderContainer>
  );
};
