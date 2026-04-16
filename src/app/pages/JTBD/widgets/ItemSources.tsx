import type { IJTBDItemSource } from '@libs/api/types/jtbd';
import React from 'react';

import ComponentTooltip from '@components/ToolTip/ComponentTooltip';

import { SourcePill } from './SourcePill';

interface ItemSourcesProps {
  sources: IJTBDItemSource[] | undefined;
}

function dedupeByUrl(sources: IJTBDItemSource[]): IJTBDItemSource[] {
  const seen = new Map<string, IJTBDItemSource>();
  for (const src of sources) {
    const key = src.sourceUrl || src.sourceLabel;
    if (!key) continue;
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, src);
    } else if (src.metricsContributed && !existing.metricsContributed) {
      seen.set(key, src);
    }
  }
  return [...seen.values()];
}

export const ItemSources: React.FC<ItemSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;

  const unique = dedupeByUrl(sources);

  return (
    <div className='mt-2 flex flex-wrap gap-1.5'>
      {unique.map((src, i) =>
        src.metricsContributed ? (
          <ComponentTooltip
            key={i}
            preferredPosition='above'
            tip={
              <div className='max-w-[400px] rounded-xl border border-white/[0.08] bg-black/80 px-4 py-3 text-sm text-white/90 shadow-2xl'>
                {src.metricsContributed}
              </div>
            }
          >
            <SourcePill
              source={src.sourceLabel}
              url={src.sourceUrl || undefined}
              sourceType={src.sourceType}
            />
          </ComponentTooltip>
        ) : (
          <SourcePill
            key={i}
            source={src.sourceLabel}
            url={src.sourceUrl || undefined}
            sourceType={src.sourceType}
          />
        ),
      )}
    </div>
  );
};
