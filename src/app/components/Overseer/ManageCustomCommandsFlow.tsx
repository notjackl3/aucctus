import { Icon } from '@components';
import {
  useCustomCommands,
  useDeleteCustomCommand,
  useUpdateCustomCommand,
} from '@hooks/query/customCommands.hook';
import type { CustomCommand } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import React, { useMemo, useState, useCallback } from 'react';

interface ManageCustomCommandsFlowProps {
  onCancel: () => void;
  onCreate: () => void;
}

interface EditFormState {
  name: string;
  label: string;
  description: string;
  promptModifier: string;
  enableWebSearch: boolean;
  enableNucleusSearch: boolean;
  isActive: boolean;
}

const PROMPT_PREVIEW_LENGTH = 160;

const getPromptPreview = (prompt: string) => {
  if (!prompt) return '';
  if (prompt.length <= PROMPT_PREVIEW_LENGTH) return prompt;
  return `${prompt.slice(0, PROMPT_PREVIEW_LENGTH)}...`;
};

const ManageCustomCommandsFlow: React.FC<ManageCustomCommandsFlowProps> = ({
  onCancel,
  onCreate,
}) => {
  const { data, isLoading } = useCustomCommands(true, true);
  const updateMutation = useUpdateCustomCommand();
  const deleteMutation = useDeleteCustomCommand();
  const [search, setSearch] = useState('');
  const [editingCommandId, setEditingCommandId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const commands = useMemo(() => data?.commands ?? [], [data?.commands]);

  const filteredCommands = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    if (!normalized) return commands;
    return commands.filter((command) =>
      [command.name, command.label, command.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalized)),
    );
  }, [commands, search]);

  const handleEdit = useCallback((command: CustomCommand) => {
    setEditingCommandId(command.uuid);
    setEditForm({
      name: command.name,
      label: command.label,
      description: command.description,
      promptModifier: command.promptModifier,
      enableWebSearch: command.enableWebSearch,
      enableNucleusSearch: command.enableNucleusSearch,
      isActive: command.isActive,
    });
  }, []);

  const handleCancelEdit = () => {
    setEditingCommandId(null);
    setEditForm(null);
  };

  const handleSave = () => {
    if (!editingCommandId || !editForm) return;

    updateMutation.mutate(
      {
        commandUuid: editingCommandId,
        data: {
          name: editForm.name,
          label: editForm.label,
          description: editForm.description,
          promptModifier: editForm.promptModifier,
          enableWebSearch: editForm.enableWebSearch,
          enableNucleusSearch: editForm.enableNucleusSearch,
          isActive: editForm.isActive,
        },
      },
      {
        onSuccess: () => {
          handleCancelEdit();
        },
      },
    );
  };

  const handleToggleActive = (command: CustomCommand) => {
    updateMutation.mutate({
      commandUuid: command.uuid,
      data: { isActive: !command.isActive },
    });
  };

  const handleDelete = (command: CustomCommand) => {
    deleteMutation.mutate(command.uuid);
    setConfirmDeleteId(null);
  };

  const totalCount = data?.totalCount ?? commands.length;
  const maxAllowed = data?.maxAllowed ?? 0;

  const isSaveDisabled =
    !editForm?.name.trim() ||
    editForm.name.trim().length < 3 ||
    !editForm.label.trim() ||
    editForm.label.trim().length < 2 ||
    !editForm.description.trim() ||
    editForm.description.trim().length < 10 ||
    !editForm.promptModifier.trim() ||
    editForm.promptModifier.trim().length < 10 ||
    editForm.promptModifier.trim().length > 2000;

  return (
    <div className='flex h-full min-h-0 flex-col'>
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-2'>
        <div className='flex items-center gap-2'>
          <button
            onClick={onCancel}
            className='flex h-7 w-7 items-center justify-center rounded-md text-white/50 transition-colors hover:bg-white/10 hover:text-white'
            aria-label='Close manage commands'
          >
            <Icon variant='closeX' width={14} height={14} />
          </button>
          <span className='text-sm font-medium text-white'>
            Manage Custom Commands
          </span>
        </div>
        <span className='text-xs text-white/50'>
          {maxAllowed > 0
            ? `${totalCount}/${maxAllowed} commands used`
            : `${totalCount} commands`}
        </span>
      </div>

      <div className='no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4'>
        <div className='flex gap-2'>
          <div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/10'>
            <Icon
              variant='sparkles'
              width={14}
              height={14}
              className='stroke-white/80'
            />
          </div>
          <div className='flex-1'>
            <p className='text-sm text-white'>
              Review and update your custom commands. Labels show in the picker;
              the /command is what you type.
            </p>
            <p className='mt-1 text-xs text-white/50'>
              Edit descriptions and prompt instructions so they stay useful.
            </p>
          </div>
        </div>

        <div className='mt-4 space-y-3'>
          {isLoading && (
            <div className='rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60'>
              Loading commands...
            </div>
          )}

          {!isLoading && filteredCommands.length === 0 && (
            <div className='rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-white/60'>
              No commands match your search.
            </div>
          )}

          {!isLoading &&
            filteredCommands.map((command) => {
              const tools = [
                command.enableWebSearch ? 'Web Search' : null,
                command.enableNucleusSearch ? 'Nucleus Search' : null,
              ].filter(Boolean) as string[];

              const isEditingCard = editingCommandId === command.uuid;

              return (
                <div
                  key={command.uuid}
                  className='rounded-lg border border-white/10 bg-white/5 p-3'
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-sm font-semibold text-white'>
                          {command.label}
                        </span>
                        <span className='rounded bg-white/10 px-2 py-0.5 font-mono text-xs text-white/70'>
                          /{command.name}
                        </span>
                        {!command.isActive && (
                          <span className='rounded bg-white/10 px-2 py-0.5 text-xs text-white/50'>
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className='mt-1 text-xs text-white/50'>
                        {command.description}
                      </p>
                    </div>

                    <div className='flex flex-wrap items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleToggleActive(command)}
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-xs transition-colors',
                          command.isActive
                            ? 'border-primary-400/60 bg-primary-500/20 text-white'
                            : 'border-white/10 text-white/50 hover:text-white',
                        )}
                      >
                        {command.isActive ? 'Active' : 'Inactive'}
                      </button>
                      <button
                        type='button'
                        onClick={() => handleEdit(command)}
                        className='rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/10'
                      >
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() =>
                          setConfirmDeleteId(
                            confirmDeleteId === command.uuid
                              ? null
                              : command.uuid,
                          )
                        }
                        className='rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 transition-colors hover:bg-white/10'
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className='mt-3 flex flex-wrap items-center gap-2 text-xs text-white/50'>
                    <span>Tools:</span>
                    {tools.length > 0 ? (
                      tools.map((tool) => (
                        <span
                          key={tool}
                          className='rounded bg-white/10 px-2 py-0.5 text-xs text-white/70'
                        >
                          {tool}
                        </span>
                      ))
                    ) : (
                      <span className='text-white/40'>None</span>
                    )}
                  </div>

                  <div className='mt-3 rounded-md border border-white/10 bg-black/20 p-3'>
                    <p className='text-xs text-white/50'>Prompt instructions</p>
                    <p className='mt-1 text-sm text-white/80'>
                      {getPromptPreview(command.promptModifier)}
                    </p>
                  </div>

                  {confirmDeleteId === command.uuid && (
                    <div className='mt-3 flex flex-wrap items-center gap-2 text-xs'>
                      <span className='text-white/60'>
                        Delete this command?
                      </span>
                      <button
                        type='button'
                        className='rounded-md border border-red-400/40 px-2 py-1 text-xs text-red-300 transition-colors hover:bg-red-500/10'
                        onClick={() => handleDelete(command)}
                      >
                        Confirm delete
                      </button>
                      <button
                        type='button'
                        className='rounded-md border border-white/10 px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10'
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {isEditingCard && editForm && (
                    <div className='mt-4 space-y-3 rounded-md border border-white/10 bg-white/5 p-3'>
                      <div className='space-y-1'>
                        <p className='text-xs text-white/50'>Command name</p>
                        <div className='relative'>
                          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-white/50'>
                            /
                          </span>
                          <input
                            type='text'
                            value={editForm.name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                name: e.target.value
                                  .toLowerCase()
                                  .replace(/[^a-z0-9-]/g, ''),
                              })
                            }
                            className='w-full rounded-lg border border-white/20 bg-white/5 py-2 pl-7 pr-3 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none'
                            placeholder='command-name'
                          />
                        </div>
                      </div>

                      <div className='space-y-1'>
                        <p className='text-xs text-white/50'>Display label</p>
                        <input
                          type='text'
                          value={editForm.label}
                          onChange={(e) =>
                            setEditForm({ ...editForm, label: e.target.value })
                          }
                          className='w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none'
                          placeholder='Display label'
                        />
                      </div>

                      <div className='space-y-1'>
                        <p className='text-xs text-white/50'>Description</p>
                        <input
                          type='text'
                          value={editForm.description}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              description: e.target.value,
                            })
                          }
                          className='w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none'
                          placeholder='Short description'
                        />
                      </div>

                      <div className='space-y-1'>
                        <p className='text-xs text-white/50'>
                          Prompt instructions
                        </p>
                        <textarea
                          value={editForm.promptModifier}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              promptModifier: e.target.value,
                            })
                          }
                          rows={4}
                          className='w-full resize-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none'
                          placeholder='Prompt instructions'
                        />
                      </div>

                      <div className='space-y-2'>
                        <p className='text-xs text-white/50'>Tools</p>
                        <div className='flex flex-col gap-2'>
                          <button
                            type='button'
                            onClick={() =>
                              setEditForm({
                                ...editForm,
                                enableWebSearch: !editForm.enableWebSearch,
                              })
                            }
                            className={cn(
                              'flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-left text-sm transition-all',
                              'ring-2 ring-offset-2 ring-offset-transparent',
                              editForm.enableWebSearch
                                ? 'ring-primary-500'
                                : 'opacity-80 ring-transparent hover:opacity-100',
                            )}
                          >
                            <Icon
                              variant='globe'
                              width={14}
                              height={14}
                              className='stroke-white/70'
                            />
                            <span className='text-white'>Web Search</span>
                          </button>
                          <button
                            type='button'
                            onClick={() =>
                              setEditForm({
                                ...editForm,
                                enableNucleusSearch:
                                  !editForm.enableNucleusSearch,
                              })
                            }
                            className={cn(
                              'flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-2 text-left text-sm transition-all',
                              'ring-2 ring-offset-2 ring-offset-transparent',
                              editForm.enableNucleusSearch
                                ? 'ring-primary-500'
                                : 'opacity-80 ring-transparent hover:opacity-100',
                            )}
                          >
                            <Icon
                              variant='compass-03'
                              width={14}
                              height={14}
                              className='stroke-white/70'
                            />
                            <span className='text-white'>Nucleus Search</span>
                          </button>
                        </div>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        <button
                          type='button'
                          onClick={handleCancelEdit}
                          className='flex-1 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 transition-colors hover:bg-white/10'
                        >
                          Cancel
                        </button>
                        <button
                          type='button'
                          onClick={handleSave}
                          disabled={isSaveDisabled}
                          className={cn(
                            'flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors',
                            isSaveDisabled
                              ? 'bg-white/10 text-white/40'
                              : 'bg-white text-black hover:bg-white/90',
                          )}
                        >
                          Save changes
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <div className='border-t border-white/10 px-4 py-3'>
        <div className='space-y-2'>
          <input
            type='text'
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search commands by name, label, or description'
            className='w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/40 focus:outline-none'
          />
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <button
              type='button'
              onClick={onCancel}
              className='text-xs text-white/40 hover:text-white/70'
            >
              ← Go back
            </button>
            <button
              type='button'
              onClick={onCreate}
              className='rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-black hover:bg-white/90'
            >
              Create new command
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCustomCommandsFlow;
