'use client';

import React, { useState } from 'react';
import { X, Download, Check } from 'lucide-react';
import { useScore } from '@/context/ScoreContext/';
import { generateMidiFile } from '@/audio/midiExport';
import { EXPORT_FORMATS } from './ExportModal.constants';
import { ExportModalProps } from './ExportModal.types';
import {
  ModalBackdrop,
  ModalCard,
  ModalHeader,
  CloseButton,
  ModalBody,
  FormatOption,
  FormatTitle,
  FormatDesc,
  ModalFooter,
  Button,
} from './ExportModal.styles';

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { score } = useScore();
  const [selectedFormat, setSelectedFormat] = useState<string>('json');
  const [downloaded, setDownloaded] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExport = () => {
    let blob: Blob;
    let fileExt = 'txt';

    if (selectedFormat === 'midi') {
      const midiBytes = generateMidiFile(score);
      blob = new Blob([midiBytes.buffer as ArrayBuffer], { type: 'audio/midi' });
      fileExt = 'mid';
    } else if (selectedFormat === 'musicxml') {
      const content = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>${score.title}</work-title></work>
  <identification><creator type="composer">${score.composer}</creator></identification>
  <part-list>
    <score-part id="P1"><part-name>${score.instrumentId}</part-name></score-part>
  </part-list>
  <part id="P1">
    ${score.measures
      .map(
        (m) => `
    <measure number="${m.index + 1}">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>${m.timeSignatureNumerator}</beats><beat-type>${m.timeSignatureDenominator}</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      ${m.notes
        .map(
          (n) => `
      <note>
        <pitch>
          <step>${n.pitch[0]}</step>
          <octave>${n.pitch.replace(/[^0-9]/g, '')}</octave>
        </pitch>
        <duration>4</duration>
        <type>${n.duration}</type>
        ${n.lyric ? `<lyric><text>${n.lyric}</text></lyric>` : ''}
      </note>`
        )
        .join('')}
    </measure>`
      )
      .join('')}
  </part>
</score-partwise>`;
      blob = new Blob([content], { type: 'application/xml' });
      fileExt = 'xml';
    } else {
      const content = JSON.stringify(score, null, 2);
      blob = new Blob([content], { type: 'application/json' });
      fileExt = 'json';
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${score.title.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
      onClose();
    }, 1200);
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalCard onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h3>Export Score</h3>
          <CloseButton onClick={onClose}>
            <X size={18} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>
            Choose an export format to save or share <strong>{score.title}</strong>:
          </p>

          {EXPORT_FORMATS.map((fmt) => (
            <FormatOption
              key={fmt.id}
              $selected={selectedFormat === fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
            >
              <FormatTitle>{fmt.label}</FormatTitle>
              <FormatDesc>{fmt.description}</FormatDesc>
            </FormatOption>
          ))}
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
          <Button $variant="primary" onClick={handleExport}>
            {downloaded ? (
              <>
                <Check size={16} style={{ marginRight: 6 }} /> Exported!
              </>
            ) : (
              <>
                <Download size={16} style={{ marginRight: 6 }} /> Download File
              </>
            )}
          </Button>
        </ModalFooter>
      </ModalCard>
    </ModalBackdrop>
  );
};
