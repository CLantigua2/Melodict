import React from 'react';
import { ScoreProvider } from '../../context/ScoreContext';
import { AppThemeProvider } from '../../theme/ThemeProvider';
import { Header } from './Header.component';

describe('Header component', () => {
  it('defines Header component successfully', () => {
    expect(Header).toBeDefined();
  });
});
