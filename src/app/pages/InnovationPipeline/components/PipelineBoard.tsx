import { PIPELINE_STAGES } from '../types/pipeline.types';
import type { ConceptsByStage } from '../types/pipeline.types';
import PipelineColumn from './PipelineColumn';

interface PipelineBoardProps {
  conceptsByStage: ConceptsByStage;
}

const PipelineBoard = ({ conceptsByStage }: PipelineBoardProps) => {
  return (
    <div className='flex gap-4 overflow-x-auto pb-4'>
      {PIPELINE_STAGES.map((stage) => (
        <PipelineColumn
          key={stage.key}
          stage={stage}
          concepts={conceptsByStage[stage.key]}
        />
      ))}
    </div>
  );
};

export default PipelineBoard;
