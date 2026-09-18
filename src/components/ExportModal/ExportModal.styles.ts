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
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
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
  }
`;

export const CloseButton = styled.button`
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 4px;
  border-radius: 4px;

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
`;

export const FormatOption = styled.div<{ $selected?: boolean }>`
  padding: 14px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  background: ${({ $selected, theme }) =>
    $selected ? theme.colors.surfaceElevated : theme.colors.surface};
  border: 1px solid
    ${({ $selected, theme }) =>
      $selected ? theme.colors.primary : theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.surfaceHover};
  }
`;

export const FormatTitle = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 4px;
`;

export const FormatDesc = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ModalFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 18px;
  border-radius: ${({ theme }) => theme.radii.sm};
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s ease;

  ${({ $variant, theme }) =>
    $variant === 'primary'
      ? `
    background: ${theme.colors.primary};
    color: ${theme.colors.textInverse};
    box-shadow: 0 2px 8px ${theme.colors.primaryGlow};
    &:hover {
      background: ${theme.colors.primaryHover};
    }
  `
      : `
    background: transparent;
    color: ${theme.colors.textSecondary};
    border: 1px solid ${theme.colors.border};
    &:hover {
      background: ${theme.colors.surfaceHover};
      color: ${theme.colors.textPrimary};
    }
  `}
`;
