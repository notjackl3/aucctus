import { motion, AnimatePresence } from 'framer-motion';
import React, { FunctionComponent } from 'react';

interface CollapsibleProps {
  toggle: boolean;
  children: React.ReactNode;
  width?: number | string;
}

const Collapsible: FunctionComponent<CollapsibleProps> = ({
  toggle = false,
  children,
  width,
}) => {
  return (
    <AnimatePresence initial={false}>
      {toggle && (
        <motion.div
          aria-expanded={toggle}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 170, damping: 26 }}
          style={{
            width: width,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Collapsible;
