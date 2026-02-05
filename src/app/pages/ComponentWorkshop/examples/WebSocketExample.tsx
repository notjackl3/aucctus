// @ts-nocheck
// DEPRECATED: This example is no longer used. Use Concept Report Workshop tab instead.
/**
 * WebSocket Component Generation Example
 *
 * This is a minimal example showing how to use the WebSocket hook
 * for real-time component generation.
 */

import React, { useState } from 'react';
import { Icon, Loading } from '@components';
import { cn } from '@libs/utils/react';
import { useComponentGeneratorWebSocket } from '@hooks/query/dynamicComponentWebSocket.hook';

/**
 * Simple example of WebSocket component generation
 */
export const WebSocketExample: React.FC = () => {
  const [query, setQuery] = useState('');

  const { generate, isStreaming, isComplete, messages, result, reset, status } =
    useComponentGeneratorWebSocket();

  const handleGenerate = async () => {
    if (!query.trim()) return;

    try {
      await generate({ query });
    } catch (error) {
      // Error is already handled by the hook with toast
    }
  };

  const handleReset = () => {
    setQuery('');
    reset();
  };

  return (
    <div className='aucctus-bg-secondary min-h-screen p-8'>
      <div className='mx-auto max-w-4xl'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='aucctus-text-2xl-bold aucctus-text-primary mb-2'>
            WebSocket Component Generation Example
          </h1>
          <p className='aucctus-text-md aucctus-text-secondary'>
            Demonstrates real-time streaming of component generation progress
          </p>
        </div>

        {/* Input Section */}
        <div className='aucctus-bg-primary aucctus-border-secondary mb-6 rounded-xl border p-6'>
          <label
            htmlFor='query'
            className='aucctus-text-sm-semibold aucctus-text-primary mb-2 block'
          >
            Component Description
          </label>
          <textarea
            id='query'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isStreaming}
            placeholder='Create a metrics card with a chart...'
            rows={3}
            className={cn(
              'aucctus-text-sm w-full resize-none rounded-lg border p-3',
              'aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary',
              'focus:outline-none focus:ring-2 focus:ring-[var(--brand-500)]',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          />
          <div className='mt-4 flex gap-3'>
            <button
              onClick={handleGenerate}
              disabled={isStreaming || !query.trim()}
              className='btn btn-primary btn-sm'
            >
              {isStreaming ? (
                <>
                  <Loading className='mr-2 h-4 w-4' />
                  Generating...
                </>
              ) : (
                <>
                  <Icon
                    variant='sparkles'
                    className='aucctus-stroke-white mr-2 h-4 w-4'
                  />
                  Generate
                </>
              )}
            </button>
            {(messages.length > 0 || result) && (
              <button
                onClick={handleReset}
                className='btn btn-secondary btn-sm'
              >
                <Icon
                  variant='refresh'
                  className='aucctus-stroke-secondary mr-2 h-4 w-4'
                />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Status Display */}
        {status !== 'idle' && (
          <div className='aucctus-bg-primary aucctus-border-secondary mb-6 rounded-xl border p-4'>
            <div className='flex items-center gap-2'>
              <div
                className={cn('h-2 w-2 rounded-full', {
                  'aucctus-bg-warning-solid animate-pulse':
                    status === 'connecting',
                  'aucctus-bg-success-solid': status === 'connected',
                  'aucctus-bg-brand-solid animate-pulse':
                    status === 'streaming',
                  'aucctus-bg-success-solid animate-pulse':
                    status === 'complete',
                  'aucctus-bg-error-solid': status === 'error',
                })}
              />
              <span className='aucctus-text-sm aucctus-text-secondary capitalize'>
                {status}
              </span>
              <span className='aucctus-text-xs aucctus-text-tertiary ml-auto'>
                {messages.length} messages
              </span>
            </div>
          </div>
        )}

        {/* Real-time Messages */}
        {messages.length > 0 && (
          <div className='aucctus-bg-primary aucctus-border-secondary mb-6 rounded-xl border p-6'>
            <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
              Live Messages
            </h3>
            <div className='max-h-96 space-y-2 overflow-y-auto'>
              {messages.slice(-20).map((msg, idx) => (
                <div
                  key={idx}
                  className={cn('rounded-lg p-3', {
                    'aucctus-bg-secondary': msg.type === 'text',
                    'aucctus-bg-info-subtle': msg.type === 'thinking',
                    'aucctus-bg-brand-secondary': msg.type === 'tool_use',
                    'aucctus-bg-success-subtle': msg.type === 'tool_result',
                    'aucctus-bg-accent-secondary': msg.type === 'system',
                    'aucctus-bg-error-subtle': msg.type === 'error',
                  })}
                >
                  <div className='aucctus-text-xs-semibold mb-1 uppercase'>
                    {msg.type}
                  </div>
                  <div className='aucctus-text-xs aucctus-text-secondary whitespace-pre-wrap'>
                    {msg.content.slice(0, 200)}
                    {msg.content.length > 200 && '...'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {isComplete && result && (
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'>
            <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-4'>
              Generation Complete
            </h3>

            {/* Metrics */}
            <div className='mb-6 grid grid-cols-2 gap-4 md:grid-cols-4'>
              <div className='aucctus-bg-secondary rounded-lg p-3'>
                <div className='aucctus-text-xs aucctus-text-tertiary mb-1'>
                  Component
                </div>
                <div className='aucctus-text-sm-semibold aucctus-text-primary'>
                  {result.generatedComponent?.name || 'N/A'}
                </div>
              </div>
              <div className='aucctus-bg-secondary rounded-lg p-3'>
                <div className='aucctus-text-xs aucctus-text-tertiary mb-1'>
                  Duration
                </div>
                <div className='aucctus-text-sm-semibold aucctus-text-primary'>
                  {result.durationMs
                    ? `${(result.durationMs / 1000).toFixed(1)}s`
                    : 'N/A'}
                </div>
              </div>
              <div className='aucctus-bg-secondary rounded-lg p-3'>
                <div className='aucctus-text-xs aucctus-text-tertiary mb-1'>
                  Cost
                </div>
                <div className='aucctus-text-sm-semibold aucctus-text-primary'>
                  {result.totalCostUsd
                    ? `$${result.totalCostUsd.toFixed(4)}`
                    : 'N/A'}
                </div>
              </div>
              <div className='aucctus-bg-secondary rounded-lg p-3'>
                <div className='aucctus-text-xs aucctus-text-tertiary mb-1'>
                  Messages
                </div>
                <div className='aucctus-text-sm-semibold aucctus-text-primary'>
                  {result.totalMessages || messages.length}
                </div>
              </div>
            </div>

            {/* Source Code Preview */}
            {result.generatedComponent?.sourceCode && (
              <details>
                <summary className='aucctus-text-sm-medium aucctus-text-secondary hover:aucctus-text-primary cursor-pointer'>
                  View Source Code
                </summary>
                <pre className='aucctus-bg-secondary mt-4 max-h-96 overflow-auto rounded-lg p-4'>
                  <code className='aucctus-text-xs aucctus-text-secondary'>
                    {result.generatedComponent.sourceCode}
                  </code>
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Instructions */}
        {status === 'idle' && (
          <div className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6'>
            <h3 className='aucctus-text-md-semibold aucctus-text-primary mb-3'>
              How It Works
            </h3>
            <ul className='aucctus-text-sm aucctus-text-secondary space-y-2'>
              <li className='flex gap-2'>
                <span>1.</span>
                <span>Enter a component description above</span>
              </li>
              <li className='flex gap-2'>
                <span>2.</span>
                <span>
                  Click &ldquo;Generate&rdquo; to start WebSocket streaming
                </span>
              </li>
              <li className='flex gap-2'>
                <span>3.</span>
                <span>Watch live messages appear in real-time</span>
              </li>
              <li className='flex gap-2'>
                <span>4.</span>
                <span>See the final result with metrics</span>
              </li>
            </ul>

            <div className='aucctus-bg-info-subtle aucctus-border-info mt-4 rounded-lg border p-4'>
              <div className='flex gap-2'>
                <Icon
                  variant='alert-circle'
                  className='aucctus-stroke-info-primary mt-0.5 h-4 w-4 flex-shrink-0'
                />
                <div className='aucctus-text-xs aucctus-text-info-primary'>
                  <strong>Note:</strong> Make sure the aucctus-dynamic-frontend
                  service is running on port 8003.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebSocketExample;
