import React from 'react';

import { JTBDViewProvider } from '../JTBDViewContext';
import JTBDCanvasInner from './JTBDCanvasInner';

const JTBDCanvas: React.FC = () => (
  <JTBDViewProvider>
    <JTBDCanvasInner />
  </JTBDViewProvider>
);

export default JTBDCanvas;
