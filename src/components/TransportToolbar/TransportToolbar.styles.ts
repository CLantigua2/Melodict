import styled from 'styled-components';

export const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) => theme.colors.surfaceElevated};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  gap: ${({ theme }) => theme.spacing.md};
  flex-wrap: wrap;
  z-index: 50;

  @media (max-width: 900px) {
    padding: 8px ${({ theme }) => theme.spacing.md};
  }
`;

export const SectionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const Divider = styled.div`
  width: 1px;
  height: 28px;
  background-color: ${({ theme }) => theme.colors.border};
  margin: 0 4px;
`;

export const TransportPlayButton = styled.button<{ $isPlaying?: boolean }>`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: ${({ $isPlaying, theme }) =>
    $isPlaying
      ? theme.colors.accentRose
      : `linear-gradient(135deg, ${theme.colors.primary}, #0284c7)`};
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.glowCyan};
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: scale(1.05);
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const IconButton = styled.button<{ $active?: boolean; $variant?: 'primary' | 'danger' | 'ghost' }>`
  width: 34px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $active, theme }) =>
    $active ? theme.colors.surfaceActive : 'transparent'};
  color: ${({ $active, theme }) =>
    $active ? theme.colors.primary : theme.colors.textSecondary};
  border: 1px solid
    ${({ $active, theme }) => ($active ? theme.colors.primary : 'transparent')};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
`;

export const DurationButton = styled.button<{ $selected?: boolean }>`
  min-width: 36px;
  height: 34px;
  padding: 0 8px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.surfaceActive : theme.colors.surface};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.textSecondary};
  border: 1px solid
    ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.borderSubtle)};
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const AccidentalButton = styled.button<{ $selected?: boolean }>`
  width: 32px;
  height: 34px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.surfaceActive : theme.colors.surface};
  color: ${({ $selected, theme }) =>
    $selected ? theme.colors.primary : theme.colors.textSecondary};
  border: 1px solid
    ${({ $selected, theme }) => ($selected ? theme.colors.primary : theme.colors.borderSubtle)};
  font-size: 1.15rem;
  font-weight: 700;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const TempoControl = styled.div`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 2px 4px;
  gap: 4px;
`;

export const TempoInput = styled.input`
  width: 44px;
  background: transparent;
  border: none;
  text-align: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:focus {
    outline: none;
  }
`;

export const SmallSelect = styled.select`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 6px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const MeasureBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 4px 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;
