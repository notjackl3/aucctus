import { FunctionComponent } from 'react';

import { ConceptStatus } from '@libs/api/types';

import utils from '@libs/utils';

import { getConceptStatusStyles } from '@libs/utils/concepts';
import { cn } from '@libs/utils/react';

export interface IConceptStatusBubbleProps {
  status: ConceptStatus;
}

const ConceptStatusBubble: FunctionComponent<IConceptStatusBubbleProps> = ({
  status,
}) => {
  const style = getConceptStatusStyles(status);

  return (
    <span
      className={cn(
        'flex w-fit gap-2 rounded-2xl border px-3 py-2',
        style.bg,
        style.border,
      )}
    >
      {<span className={cn(style.text)}>●</span>}
      <span
        className={cn(
          'whitespace-nowrap text-center text-base font-medium not-italic leading-6',
          style.text,
        )}
      >
        {utils.string.camelCaseToTitleCase(status)}
      </span>
    </span>
  );
};

export default ConceptStatusBubble;
