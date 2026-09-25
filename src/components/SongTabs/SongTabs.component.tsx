'use client';

import React, { useState } from 'react';
import { Music, Plus, X } from 'lucide-react';
import { useScore } from '@/context/ScoreContext/';
import { SongTabsProps } from './SongTabs.types';
import {
  TabsContainer,
  TabItem,
  TabIcon,
  TabTitleText,
  TabTitleInput,
  TabComposerText,
  CloseTabButton,
  NewTabButton,
} from './SongTabs.styles';

export const SongTabs: React.FC<SongTabsProps> = () => {
  const {
    score,
    openScores,
    loadScoreById,
    createNewScore,
    closeTab,
    updateScoreMeta,
  } = useScore();

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <TabsContainer>
      {openScores.map((s) => {
        const isActive = s.id === score.id;
        const isEditing = editingId === s.id && isActive;

        return (
          <TabItem
            key={s.id}
            $isActive={isActive}
            onClick={() => {
              if (!isActive) {
                loadScoreById(s.id);
                setEditingId(null);
              }
            }}
            title={`Switch to: ${s.title}`}
          >
            <TabIcon $isActive={isActive}>
              <Music size={14} />
            </TabIcon>

            {isEditing ? (
              <TabTitleInput
                autoFocus
                value={score.title}
                onChange={(e) => updateScoreMeta({ title: e.target.value })}
                onBlur={() => setEditingId(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === 'Escape') {
                    setEditingId(null);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <TabTitleText
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setEditingId(s.id);
                }}
                title="Double click to rename"
              >
                {isActive ? score.title : s.title}
              </TabTitleText>
            )}

            {s.composer && !isEditing && (
              <TabComposerText>({s.composer})</TabComposerText>
            )}

            {openScores.length > 1 && (
              <CloseTabButton
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(s.id);
                }}
                title="Close tab (keeps saved in Library)"
              >
                <X size={12} />
              </CloseTabButton>
            )}
          </TabItem>
        );
      })}

      <NewTabButton onClick={createNewScore} title="Create new song score">
        <Plus size={14} />
        <span>New Song</span>
      </NewTabButton>
    </TabsContainer>
  );
};
