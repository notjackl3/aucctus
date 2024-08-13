import { FunctionComponent } from 'react';

import { ConceptStatus } from '@libs/api/types';

import utils from '@libs/utils';

import { getConceptStatusStyles } from '@libs/utils/concepts';
import classNames from 'classnames';

export interface IConceptStatusBubbleProps {
  status: ConceptStatus;
}

const ConceptStatusBubble: FunctionComponent<IConceptStatusBubbleProps> = ({ status }) => {
  const style = getConceptStatusStyles(status);

  return (
    <span className={classNames('flex w-fit gap-2 rounded-2xl px-3 py-1', style.bg)}>
      {<span className={classNames(style.text)}>●</span>}
      <span
        className={classNames('whitespace-nowrap text-center text-sm font-medium not-italic leading-6', style.text)}
      >
        {utils.string.camelCaseToTitleCase(status)}
      </span>
    </span>
  );
};

export default ConceptStatusBubble;
