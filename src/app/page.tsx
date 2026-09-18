'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Header } from '@/components/Header';
import { SongTabs } from '@/components/SongTabs';
import { TransportToolbar } from '@/components/TransportToolbar';
import { NotationCanvas } from '@/components/NotationCanvas';
import { VirtualPiano } from '@/components/VirtualPiano';
import { ExportModal } from '@/components/ExportModal';
import { useScore } from '@/context/ScoreContext';

const AppContainer = styled.main`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
`;

const WorkspaceArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
`;

export default function MelodictStudioPage() {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const { togglePlayback, stopPlayback, deleteSelectedNote, selectedNoteId } = useScore();

  // Global hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or select
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlayback();
      } else if (e.key === 'Escape') {
        stopPlayback();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNoteId) {
          e.preventDefault();
          deleteSelectedNote();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayback, stopPlayback, deleteSelectedNote, selectedNoteId]);

  return (
    <AppContainer>
      {/* Top Navigation & Status Bar */}
      <Header onOpenExportModal={() => setIsExportOpen(true)} />

      {/* Song Tabs Bar */}
      <SongTabs />

      {/* Main Interactive Studio Workspace */}
      <WorkspaceArea>
        {/* Playback Transport & Notation Tool Palette */}
        <TransportToolbar />

        {/* Interactive Musical Staff & Sheet Music Canvas */}
        <NotationCanvas />

        {/* Interactive Virtual Piano Keyboard */}
        <VirtualPiano />
      </WorkspaceArea>

      {/* Export Score Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </AppContainer>
  );
}
