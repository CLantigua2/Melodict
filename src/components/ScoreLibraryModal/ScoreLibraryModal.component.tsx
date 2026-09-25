'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  FolderOpen,
  Search,
  Plus,
  Trash2,
  Play,
  Clock,
  Music2,
  FileText,
} from 'lucide-react';
import { useScore } from '@/context/ScoreContext/';
import { ScoreLibraryModalProps } from './ScoreLibraryModal.types';
import {
  ModalBackdrop,
  ModalCard,
  ModalHeader,
  CloseButton,
  ModalBody,
  SearchAndActionBar,
  SearchInputWrapper,
  SearchInput,
  ScoresList,
  ScoreCard,
  ScoreMeta,
  ScoreTitleRow,
  ActiveTag,
  ScoreDetailsRow,
  CardActions,
  CardButton,
  EmptyState,
} from './ScoreLibraryModal.styles';

export const ScoreLibraryModal: React.FC<ScoreLibraryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    scoresList,
    score: activeScore,
    openScoreIds,
    loadScoreById,
    createNewScore,
    deleteScoreFromLibrary,
    userId,
  } = useScore();

  const [searchQuery, setSearchQuery] = useState('');

  const filteredScores = useMemo(() => {
    if (!searchQuery.trim()) return scoresList;
    const q = searchQuery.toLowerCase();
    return scoresList.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.composer.toLowerCase().includes(q) ||
        (s.instrumentId && s.instrumentId.toLowerCase().includes(q))
    );
  }, [scoresList, searchQuery]);

  if (!isOpen) return null;

  const handleSelectScore = (id: string) => {
    loadScoreById(id);
    onClose();
  };

  const handleCreateNew = () => {
    createNewScore();
    onClose();
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (scoresList.length <= 1) return;
    await deleteScoreFromLibrary(id);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>
            <FolderOpen size={20} />
            <span>My Saved Scores & Library</span>
          </h3>
          <CloseButton onClick={onClose} title="Close">
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <SearchAndActionBar>
            <SearchInputWrapper>
              <Search size={16} />
              <SearchInput
                type="text"
                placeholder="Search compositions by title, composer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </SearchInputWrapper>

            <CardButton $variant="primary" onClick={handleCreateNew} title="Create New Score">
              <Plus size={14} />
              <span>New Score</span>
            </CardButton>
          </SearchAndActionBar>

          {filteredScores.length === 0 ? (
            <EmptyState>
              <FileText size={36} />
              <h4>No scores found</h4>
              <p>Try searching for a different title or create a brand new score.</p>
            </EmptyState>
          ) : (
            <ScoresList>
              {filteredScores.map((s) => {
                const isActive = s.id === activeScore.id;
                const isOpenInTab = openScoreIds.includes(s.id);
                const totalNotes = (s.lines || [])
                  .flatMap((l) => l.measures)
                  .flatMap((m) => m.notes)
                  .filter((n) => !n.isRest).length;

                return (
                  <ScoreCard
                    key={s.id}
                    $isActive={isActive}
                    onClick={() => handleSelectScore(s.id)}
                  >
                    <ScoreMeta>
                      <ScoreTitleRow>
                        <h4>{s.title || 'Untitled Composition'}</h4>
                        {isActive && <ActiveTag>Active</ActiveTag>}
                        {!isActive && isOpenInTab && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: 'rgba(255, 255, 255, 0.1)',
                              color: '#94a3b8',
                            }}
                          >
                            Open in Tab
                          </span>
                        )}
                      </ScoreTitleRow>

                      <ScoreDetailsRow>
                        <span>By {s.composer || 'Anonymous'}</span>
                        <span>&bull;</span>
                        <span>{s.timeSignatureNumerator}/{s.timeSignatureDenominator} Time</span>
                        <span>&bull;</span>
                        <span>Key: {s.keySignature}</span>
                        <span>&bull;</span>
                        <span>{totalNotes} notes</span>
                        {s.updatedAt && (
                          <>
                            <span>&bull;</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Clock size={11} /> {formatDate(s.updatedAt)}
                            </span>
                          </>
                        )}
                      </ScoreDetailsRow>
                    </ScoreMeta>

                    <CardActions>
                      <CardButton
                        $variant={isActive ? 'primary' : 'ghost'}
                        onClick={() => handleSelectScore(s.id)}
                        title="Open this score in editor"
                      >
                        <Play size={12} />
                        <span>{isActive ? 'Current' : 'Open'}</span>
                      </CardButton>

                      {scoresList.length > 1 && (
                        <CardButton
                          $variant="danger"
                          onClick={(e) => handleDelete(e, s.id)}
                          title="Permanently delete this score from library"
                        >
                          <Trash2 size={13} />
                        </CardButton>
                      )}
                    </CardActions>
                  </ScoreCard>
                );
              })}
            </ScoresList>
          )}
        </ModalBody>
      </ModalCard>
    </ModalBackdrop>
  );
};
