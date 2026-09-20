import styled from 'styled-components';

export const ModalBackdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 16px;
`;

export const ModalCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  width: 100%;
  max-width: 620px;
  max-height: 85vh;
  box-shadow: ${({ theme }) => theme.shadows.lg};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.textPrimary};
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const CloseButton = styled.button`
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const ModalBody = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
`;

export const SearchAndActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;

  svg {
    position: absolute;
    left: 12px;
    color: ${({ theme }) => theme.colors.textMuted};
    pointer-events: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border-radius: ${({ theme }) => theme.radii.sm};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const ScoresList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
  padding-right: 4px;
`;

export const ScoreCard = styled.div<{ $isActive?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.surfaceActive : theme.colors.surfaceElevated};
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.primary : theme.colors.border};
  transition: all 0.15s ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const ScoreMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ScoreTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  h4 {
    font-size: 0.95rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.textPrimary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const ActiveTag = styled.span`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.primary};
  color: #000000;
`;

export const ScoreDetailsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-wrap: wrap;
`;

export const CardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 12px;
`;

export const CardButton = styled.button<{ $variant?: 'primary' | 'danger' | 'ghost' }>`
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.xs};
  font-size: 0.78rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.15s ease;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: #000000;
          &:hover { filter: brightness(1.1); }
        `;
      case 'danger':
        return `
          background: transparent;
          color: ${theme.colors.accentRose};
          border: 1px solid transparent;
          &:hover {
            background: rgba(244, 63, 94, 0.15);
            border-color: ${theme.colors.accentRose};
          }
        `;
      default:
        return `
          background: ${theme.colors.surface};
          color: ${theme.colors.textPrimary};
          border: 1px solid ${theme.colors.border};
          &:hover {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.primary};
          }
        `;
    }
  }}
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  gap: 12px;
  text-align: center;

  p {
    font-size: 0.85rem;
  }
`;
