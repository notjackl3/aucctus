import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

interface CollapsibleProp {
  children: React.ReactNode;
  open?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Collapsible: React.FC<CollapsibleProp> = ({
  children,
  open = false,
  className,
}) => {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(Collapsible);
