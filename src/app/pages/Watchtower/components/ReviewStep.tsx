import { motion } from 'framer-motion';
import { Check, Plus, Trash2 } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface SuggestedRule {
  id: string;
  text: string;
}

interface ReviewStepProps {
  viewName: string;
  onViewNameChange: (name: string) => void;
  suggestedRules: SuggestedRule[];
  onRemoveRule: (id: string) => void;
  onEditRule: (id: string, newText: string) => void;
  onAddRule: (text: string) => void;
  onBack: () => void;
  onApprove: () => void;
  isApproveDisabled: boolean;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  viewName,
  onViewNameChange,
  suggestedRules,
  onRemoveRule,
  onEditRule,
  onAddRule,
  onBack,
  onApprove,
  isApproveDisabled,
}) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [editingRuleText, setEditingRuleText] = useState('');
  const [newRuleText, setNewRuleText] = useState('');

  const handleStartEditRule = useCallback((rule: SuggestedRule) => {
    setEditingRuleId(rule.id);
    setEditingRuleText(rule.text);
  }, []);

  const handleSaveEditRule = useCallback(() => {
    if (editingRuleId && editingRuleText.trim()) {
      onEditRule(editingRuleId, editingRuleText.trim());
    }
    setEditingRuleId(null);
    setEditingRuleText('');
  }, [editingRuleId, editingRuleText, onEditRule]);

  const handleAddRule = useCallback(() => {
    if (!newRuleText.trim()) return;
    onAddRule(newRuleText.trim());
    setNewRuleText('');
  }, [newRuleText, onAddRule]);

  return (
    <motion.div
      key='review'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className='p-6'
    >
      <div className='mb-5 flex items-center gap-3'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10'>
          <Check size={20} className='text-emerald-400' />
        </div>
        <div>
          <h2 className='text-base font-semibold text-white'>
            Review Monitoring Rules
          </h2>
          <p className='text-xs text-white/40'>
            Approve or customize the AI-suggested rules
          </p>
        </div>
      </div>

      {/* View name */}
      <div className='mb-4'>
        <label className='mb-1.5 block text-xs font-medium text-white/40'>
          Watchtower Name
        </label>
        <input
          value={viewName}
          onChange={(e) => onViewNameChange(e.target.value)}
          className='h-9 w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10'
        />
      </div>

      {/* Rules list */}
      <div className='mb-4'>
        <label className='mb-2 block text-xs font-medium text-white/40'>
          Monitoring Rules ({suggestedRules.length})
        </label>
        <div className='max-h-[200px] space-y-2 overflow-y-auto'>
          {suggestedRules.map((rule) => (
            <div
              key={rule.id}
              className='group flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2'
            >
              <Check size={14} className='flex-shrink-0 text-emerald-400' />
              {editingRuleId === rule.id ? (
                <input
                  autoFocus
                  value={editingRuleText}
                  onChange={(e) => setEditingRuleText(e.target.value)}
                  onBlur={handleSaveEditRule}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEditRule();
                    if (e.key === 'Escape') {
                      setEditingRuleId(null);
                      setEditingRuleText('');
                    }
                  }}
                  className='flex-1 border-none bg-transparent text-sm text-white outline-none'
                />
              ) : (
                <span
                  className='flex-1 cursor-text text-sm text-white/80 transition-colors hover:text-white'
                  onClick={() => handleStartEditRule(rule)}
                >
                  {rule.text}
                </span>
              )}
              <button
                onClick={() => onRemoveRule(rule.id)}
                className='rounded p-1 text-white/30 opacity-0 transition-colors hover:text-red-400 group-hover:opacity-100'
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add custom rule */}
        <div className='mt-2 flex gap-2'>
          <input
            placeholder='Add a custom rule...'
            value={newRuleText}
            onChange={(e) => setNewRuleText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddRule()}
            className='h-8 flex-1 rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white placeholder:text-white/20 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/10'
          />
          <button
            className='flex h-8 items-center rounded-md border border-white/[0.15] px-2 text-white/50 transition-colors hover:border-white/[0.3] hover:text-white disabled:opacity-30'
            onClick={handleAddRule}
            disabled={!newRuleText.trim()}
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className='mt-1 flex justify-end gap-2'>
        <button
          onClick={onBack}
          className='rounded-md border border-white/[0.15] px-3 py-1.5 text-sm text-white/50 transition-colors hover:border-white/[0.3] hover:text-white'
        >
          Back
        </button>
        <button
          onClick={onApprove}
          disabled={isApproveDisabled}
          className='inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30'
        >
          <Check size={14} />
          Deploy Watchtower
        </button>
      </div>
    </motion.div>
  );
};

export default ReviewStep;
