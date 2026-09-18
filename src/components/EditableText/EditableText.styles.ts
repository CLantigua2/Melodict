import styled from 'styled-components';

export const InvisibleInput = styled.input`
  border: none;
  background: transparent;
  outline: none;
  box-shadow: none;
  padding: 0;
  margin: 0;
  width: 100%;
  font: inherit;
  font-size: inherit;
  font-weight: inherit;
  font-style: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: inherit;
  line-height: inherit;
  cursor: text;
  caret-color: ${({ theme }) => theme.colors.primary};
  box-sizing: border-box;
  display: block;

  &::placeholder {
    color: inherit;
    opacity: 0.35;
    font-style: italic;
  }

  &:focus {
    outline: none;
    border: none;
    box-shadow: none;
    background: transparent;
  }

  &:disabled {
    cursor: default;
    opacity: 0.7;
  }
`;
