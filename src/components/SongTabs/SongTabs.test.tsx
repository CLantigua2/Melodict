import React from 'react';
import { SongTabs } from './SongTabs.component';
import { ScoreProvider, useScore } from '../../context/ScoreContext';
import { AppThemeProvider } from '../../theme/ThemeProvider';

describe('SongTabs component', () => {
  it('defines SongTabs component successfully', () => {
    expect(SongTabs).toBeDefined();
  });
});
