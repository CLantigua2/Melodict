import styled from 'styled-components';

export const PianoContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px 12px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  user-select: none;
`;

export const PianoHeader = styled.div`
  width: 100%;
  max-width: 1000px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
`;

export const PianoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const KeysScrollWrapper = styled.div`
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  justify-content: center;
  padding-bottom: 4px;

  @media (max-width: 900px) {
    justify-content: flex-start;
  }
`;

export const KeyboardRoll = styled.div`
  position: relative;
  display: flex;
  height: 120px;
  background: #0f1218;
  border-radius: ${({ theme }) => theme.radii.sm};
  padding: 3px;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.6);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const WhiteKey = styled.div<{ $isActive?: boolean }>`
  width: 32px;
  height: 114px;
  background: ${({ $isActive, theme }) =>
    $isActive
      ? theme.colors.pianoWhiteKeyActive
      : 'linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%)'};
  border: 1px solid #cbd5e1;
  border-radius: 0 0 4px 4px;
  box-shadow: ${({ $isActive, theme }) =>
    $isActive
      ? `0 0 12px ${theme.colors.primaryGlow}`
      : '0 2px 3px rgba(0, 0, 0, 0.2)'};
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 6px;
  position: relative;
  z-index: 1;
  transition: background 0.08s ease, transform 0.05s ease;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? '#38bdf8' : '#ffffff')};
  }

  &:active {
    background: #38bdf8;
    transform: translateY(1px);
  }
`;

export const BlackKey = styled.div<{ $isActive?: boolean; $leftOffset: number }>`
  position: absolute;
  left: ${({ $leftOffset }) => $leftOffset}px;
  top: 3px;
  width: 20px;
  height: 72px;
  background: ${({ $isActive, theme }) =>
    $isActive
      ? theme.colors.pianoBlackKeyActive
      : 'linear-gradient(to bottom, #334155 0%, #0f172a 100%)'};
  border-radius: 0 0 3px 3px;
  border: 1px solid #020617;
  box-shadow: ${({ $isActive, theme }) =>
    $isActive
      ? `0 0 12px ${theme.colors.primaryGlow}`
      : '0 3px 6px rgba(0, 0, 0, 0.5)'};
  cursor: pointer;
  z-index: 2;
  transition: background 0.08s ease, transform 0.05s ease;

  &:hover {
    background: ${({ $isActive }) => ($isActive ? '#0284c7' : '#1e293b')};
  }

  &:active {
    background: #0284c7;
    transform: translateY(1px);
  }
`;

export const KeyLabel = styled.span<{ $isC?: boolean }>`
  font-size: 0.65rem;
  font-weight: ${({ $isC }) => ($isC ? '800' : '600')};
  color: ${({ $isC, theme }) => ($isC ? theme.colors.primary : '#64748b')};
  pointer-events: none;
`;
