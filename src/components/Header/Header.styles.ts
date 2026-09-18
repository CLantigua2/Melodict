import styled from 'styled-components';

export const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing.xl};
  height: 64px;
  background-color: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 100;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (max-width: 900px) {
    padding: 0 ${({ theme }) => theme.spacing.md};
    height: auto;
    flex-wrap: wrap;
    padding-top: ${({ theme }) => theme.spacing.sm};
    padding-bottom: ${({ theme }) => theme.spacing.sm};
  }
`;

export const BrandSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

export const LogoBadge = styled.div`
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.secondary});
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: ${({ theme }) => theme.shadows.glowCyan};
`;

export const BrandTitle = styled.h1`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 6px;

  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const MvpBadge = styled.span`
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.radii.xs};
  letter-spacing: 0.05em;
`;

export const ScoreTitleInput = styled.input`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 600;
  width: 200px;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryGlow};
  }
`;

export const MiddleSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
  flex: 1;
  justify-content: center;

  @media (max-width: 900px) {
    order: 3;
    width: 100%;
    justify-content: flex-start;
  }
`;

export const SelectWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export const StyledSelect = styled.select`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 6px 30px 6px 12px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
  font-weight: 500;
  appearance: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryGlow};
  }
`;

export const SelectIcon = styled.div`
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: ${({ theme }) => theme.colors.textMuted};
  display: flex;
  align-items: center;
`;

export const ControlsGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

export const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.colors.surfaceElevated};
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.radii.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const VolumeSlider = styled.input`
  width: 70px;
  height: 4px;
  cursor: pointer;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'ghost' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.colors.primary};
          color: ${theme.colors.textInverse};
          box-shadow: 0 2px 10px ${theme.colors.primaryGlow};
          &:hover {
            background: ${theme.colors.primaryHover};
            transform: translateY(-1px);
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.surfaceElevated};
          border: 1px solid ${theme.colors.border};
          color: ${theme.colors.textPrimary};
          &:hover {
            background: ${theme.colors.surfaceHover};
            border-color: ${theme.colors.primary};
          }
        `;
      default:
        return `
          background: transparent;
          color: ${theme.colors.textSecondary};
          &:hover {
            color: ${theme.colors.textPrimary};
            background: ${theme.colors.surfaceHover};
          }
        `;
    }
  }}
`;

export const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.accentAmber};
  animation: pulse 1.5s infinite;

  @keyframes pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
`;
