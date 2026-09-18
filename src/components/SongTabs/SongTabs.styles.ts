import styled from 'styled-components';

export const TabsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  height: 42px;
  overflow-x: auto;
  overflow-y: hidden;
  user-select: none;
  z-index: 80;

  &::-webkit-scrollbar {
    height: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 2px;
  }

  @media (max-width: 900px) {
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

export const TabItem = styled.div<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  height: 34px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  background: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.background : 'transparent'};
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.textPrimary : theme.colors.textSecondary};
  border: 1px solid
    ${({ $isActive, theme }) =>
      $isActive ? theme.colors.border : 'transparent'};
  border-bottom: ${({ $isActive, theme }) =>
    $isActive ? `2px solid ${theme.colors.primary}` : 'none'};
  transition: all 0.15s ease;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '500')};

  &:hover {
    background: ${({ $isActive, theme }) =>
      $isActive ? theme.colors.background : theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const TabIcon = styled.span<{ $isActive: boolean }>`
  font-size: 0.85rem;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.primary : theme.colors.textMuted};
  display: flex;
  align-items: center;
`;

export const TabTitleText = styled.span`
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const TabTitleInput = styled.input`
  background: transparent;
  border: none;
  border-bottom: 1px dashed ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 0.85rem;
  font-weight: 600;
  max-width: 160px;
  padding: 0 2px;
  outline: none;
`;

export const TabComposerText = styled.span`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CloseTabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textMuted};
  background: transparent;
  padding: 0;
  opacity: 0.6;
  transition: all 0.15s ease;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.accentRose};
  }
`;

export const NewTabButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  height: 30px;
  border-radius: ${({ theme }) => theme.radii.xs};
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-left: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;
