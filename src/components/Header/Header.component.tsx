'use client';

import React, { useState } from 'react';
import {
  Music,
  ChevronDown,
  Volume2,
  VolumeX,
  Palette,
  Share2,
  Loader2,
  Cloud,
  CloudOff,
  AlertCircle,
  User,
  Check,
  FolderOpen,
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
  MiddleSection,
  SelectWrapper,
  StyledSelect,
  SelectIcon,
  ControlsGroup,
  VolumeControl,
  VolumeSlider,
  ActionButton,
  LoadingIndicator,
  SaveStatusBadge,
  UserBadge,
} from './Header.styles';

export const Header: React.FC<HeaderProps> = ({
  onOpenExportModal,
  onOpenLibraryModal,
}) => {
  const {
    score,
    changeInstrument,
    masterVolume,
    setMasterVolume,
    isInstrumentLoading,
    userId,
    saveStatus,
    scoresList,
  } = useScore();

  const { themeName, setThemeName } = useAppTheme();
  const [copiedUser, setCopiedUser] = useState(false);

  const handleCopyUserId = () => {
    if (!userId || typeof navigator === 'undefined') return;
    navigator.clipboard?.writeText(userId).then(() => {
      setCopiedUser(true);
      setTimeout(() => setCopiedUser(false), 2000);
    });
  };

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
        {/* Cloud Auto-Save Status */}
        <SaveStatusBadge
          $status={saveStatus}
          title={
            saveStatus === 'saved'
              ? 'All changes automatically saved to backend cloud storage'
              : saveStatus === 'saving'
              ? 'Saving changes to backend...'
              : saveStatus === 'offline'
              ? 'Offline mode: changes cached locally'
              : 'Error saving to backend, retrying...'
          }
        >
          {saveStatus === 'saving' && <Loader2 size={12} className="animate-spin" />}
          {saveStatus === 'saved' && <Cloud size={12} />}
          {saveStatus === 'offline' && <CloudOff size={12} />}
          {saveStatus === 'error' && <AlertCircle size={12} />}
          <span style={{ textTransform: 'capitalize' }}>
            {saveStatus === 'saving'
              ? 'Saving...'
              : saveStatus === 'saved'
              ? 'Cloud Saved'
              : saveStatus === 'offline'
              ? 'Offline Cache'
              : 'Sync Error'}
          </span>
        </SaveStatusBadge>

        {/* Anonymous User UUID Pill */}
        {userId && (
          <UserBadge
            onClick={handleCopyUserId}
            title={`Anonymous User UUID: ${userId}\nClick to copy your unique ID`}
          >
            {copiedUser ? <Check size={12} style={{ color: '#00e5ff' }} /> : <User size={12} />}
            <span>{copiedUser ? 'Copied ID!' : `Guest #${userId.slice(0, 6)}`}</span>
          </UserBadge>
        )}

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

        {/* Saved Scores Library */}
        <ActionButton
          $variant="secondary"
          onClick={onOpenLibraryModal}
          title="Browse all saved scores in your library"
        >
          <FolderOpen size={16} />
          <span>Library ({scoresList.length})</span>
        </ActionButton>

        {/* Export / Share */}
        <ActionButton $variant="primary" onClick={onOpenExportModal} title="Export Composition">
          <Share2 size={16} />
          <span>Export</span>
        </ActionButton>
      </ControlsGroup>
    </HeaderContainer>
  );
};
