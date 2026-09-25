import React from 'react';
import { ScoreLibraryModal } from './ScoreLibraryModal.component';
import { ScoreProvider } from '../../context/ScoreContext/';
import { AppThemeProvider } from '../../theme/ThemeProvider';

describe('ScoreLibraryModal component', () => {
  it('defines ScoreLibraryModal component successfully', () => {
    expect(ScoreLibraryModal).toBeDefined();
  });
});
