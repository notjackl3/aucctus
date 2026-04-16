import React from 'react';

import { JTBDViewProvider } from '../JTBDViewContext';
import JTBDCanvasInner from './JTBDCanvasInner';

interface JTBDCanvasProps {
  /** Whether the current user is an account admin (controls mutative actions). */
  isAdmin?: boolean;
}

const JTBDCanvas: React.FC<JTBDCanvasProps> = ({ isAdmin = false }) => (
  <JTBDViewProvider>
    <JTBDCanvasInner isAdmin={isAdmin} />
  </JTBDViewProvider>
);

export default JTBDCanvas;
