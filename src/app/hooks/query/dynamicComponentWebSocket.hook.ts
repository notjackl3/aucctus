// @ts-nocheck
// DEPRECATED: This file is no longer used. The new implementation uses
// osiris endpoints with WebSocket events. See dynamicComponent.hook.ts instead.
/**
 * WebSocket hooks for Dynamic Component Generation
 *
 * Provides real-time streaming of component generation progress
 * using WebSocket connections to the aucctus-dynamic-frontend service.
 *
 * Supports two modes:
 * - Mode 1: Query parameters (simple, no files) - query passed in URL
 * - Mode 2: Initial message (with files) - connect without query, then send
 *           initial JSON message with query and base64-encoded files
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from 'react-query';
import { toast } from '@components';
import { AucctusQueryKeys } from './query-keys';
import type {
  IAgentMessage,
  IGenerateComponentResponse,
} from '@libs/api/types/dynamicComponent.d';

/**
 * WebSocket message event types
 */
type WebSocketEventType =
  | 'connected'
  | 'files_received'
  | 'message'
  | 'result'
  | 'complete'
  | 'error';

/**
 * WebSocket message structure
 */
interface IWebSocketMessage {
  event: WebSocketEventType;
  data: any;
  timestamp: string;
}

/**
 * File data structure for WebSocket initial message
 */
interface IWebSocketFileData {
  filename: string;
  content: string; // Base64-encoded content
  content_type: string;
}

/**
 * Generation request with optional file uploads
 */
interface IGenerateRequest {
  /** Natural language description of the component */
  query: string;
  /** Optional reference files (images, mockups, schemas, etc.) */
  files?: File[];
  /** Maximum agent turns */
  maxTurns?: number;
  /** Maximum thinking tokens */
  maxThinkingTokens?: number;
}

/**
 * WebSocket connection status
 */
type ConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'streaming'
  | 'complete'
  | 'error'
  | 'disconnected';

/**
 * Get the base WebSocket URL for the dynamic component API
 */
const getDynamicComponentWsUrl = (): string => {
  const httpUrl =
    import.meta.env.VITE_DYNAMIC_FRONTEND_URL || 'http://localhost:8003';
  // Convert http:// to ws:// and https:// to wss://
  return httpUrl.replace(/^http/, 'ws');
};

/**
 * Convert a File to base64 string
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert files to WebSocket file data format (base64-encoded)
 */
const filesToWebSocketData = async (
  files: File[],
): Promise<IWebSocketFileData[]> => {
  return Promise.all(
    files.map(async (file) => ({
      filename: file.name,
      content: await fileToBase64(file),
      content_type: file.type || 'application/octet-stream',
    })),
  );
};

/**
 * Hook for generating components with WebSocket streaming
 *
 * Provides real-time updates as the component is being generated,
 * including thinking blocks, tool usage, and progress messages.
 *
 * @example
 * ```tsx
 * const { generate, isStreaming, messages, result } = useComponentGeneratorWebSocket();
 *
 * const handleGenerate = async () => {
 *   await generate({ query: 'Create a metrics dashboard' });
 * };
 *
 * // Messages update in real-time as generation progresses
 * ```
 */
export const useComponentGeneratorWebSocket = () => {
  const queryClient = useQueryClient();

  // State
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [messages, setMessages] = useState<IAgentMessage[]>([]);
  const [result, setResult] = useState<IGenerateComponentResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // WebSocket ref
  const wsRef = useRef<WebSocket | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Clean up WebSocket connection
   */
  const cleanup = useCallback(() => {
    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    cleanup();
    setStatus('idle');
    setMessages([]);
    setResult(null);
    setError(null);
  }, [cleanup]);

  /**
   * Generate a component using WebSocket streaming
   *
   * Supports two modes:
   * - Mode 1: Query parameters (no files) - query passed in URL
   * - Mode 2: Initial message (with files) - connect without query, then send
   *           initial JSON message with query and base64-encoded files
   */
  const generate = useCallback(
    async (request: IGenerateRequest) => {
      // Clean up any existing connection
      cleanup();

      // Reset state
      setStatus('connecting');
      setMessages([]);
      setResult(null);
      setError(null);

      // Create abort controller for cleanup
      abortControllerRef.current = new AbortController();

      const hasFiles = request.files && request.files.length > 0;

      try {
        const wsUrl = getDynamicComponentWsUrl();
        let url: string;

        if (hasFiles) {
          // Mode 2: Connect without query params, will send initial message
          url = `${wsUrl}/v1/component/generate-ws`;
        } else {
          // Mode 1: Build WebSocket URL with query parameters
          const params = new URLSearchParams({
            query: request.query,
            ...(request.maxTurns && { max_turns: String(request.maxTurns) }),
            ...(request.maxThinkingTokens && {
              max_thinking_tokens: String(request.maxThinkingTokens),
            }),
          });
          url = `${wsUrl}/v1/component/generate-ws?${params.toString()}`;
        }

        // Create WebSocket connection
        const ws = new WebSocket(url);
        wsRef.current = ws;

        // Track start time
        const startTime = Date.now();

        return new Promise<IGenerateComponentResponse>((resolve, reject) => {
          ws.onopen = async () => {
            setStatus('connected');

            // If files are provided, send initial message with base64-encoded files
            if (hasFiles && request.files) {
              try {
                setMessages([
                  {
                    type: 'system',
                    content: `Uploading ${request.files.length} file(s)...`,
                    timestamp: new Date().toISOString(),
                  },
                ]);

                const filesData = await filesToWebSocketData(request.files);

                const initialMessage = {
                  query: request.query,
                  max_turns: request.maxTurns || 150,
                  max_thinking_tokens: request.maxThinkingTokens || 30000,
                  files: filesData,
                };

                ws.send(JSON.stringify(initialMessage));
              } catch (err) {
                const error = new Error('Failed to process files for upload');
                setStatus('error');
                setError(error);
                toast.error('Upload Failed', error.message);
                reject(error);
              }
            }
          };

          ws.onmessage = (event) => {
            try {
              const message: IWebSocketMessage = JSON.parse(event.data);

              switch (message.event) {
                case 'connected':
                  // For Mode 2 (with files), we may receive this first
                  // Mode indicates whether we're awaiting input or starting
                  if (message.data?.mode === 'awaiting_input') {
                    // Server is waiting for our initial message - already sent in onopen
                    setStatus('streaming');
                  } else {
                    setStatus('streaming');
                  }
                  break;

                case 'files_received':
                  // Server acknowledged file upload
                  setMessages((prev) => [
                    ...prev,
                    {
                      type: 'system',
                      content: `Files received: ${message.data?.files?.join(', ') || 'Processing...'}`,
                      timestamp: new Date().toISOString(),
                    },
                  ]);
                  break;

                case 'message':
                  // Add agent message to list
                  const agentMsg: IAgentMessage = message.data;
                  setMessages((prev) => [...prev, agentMsg]);
                  break;

                case 'result':
                  // Store execution metrics
                  setResult((prev) => ({
                    ...(prev || ({} as any)),
                    durationMs: message.data.duration_ms,
                    numTurns: message.data.num_turns,
                    totalCostUsd: message.data.total_cost_usd,
                  }));
                  break;

                case 'complete':
                  setStatus('complete');

                  // Build final result
                  const finalResult: IGenerateComponentResponse = {
                    query: request.query,
                    model: message.data.model || 'claude-sonnet-4-20250514',
                    messages: messages,
                    totalMessages:
                      message.data.total_messages || messages.length,
                    status: message.data.status || 'success',
                    error: message.data.error,
                    durationMs:
                      message.data.duration_ms || Date.now() - startTime,
                    numTurns: message.data.num_turns,
                    totalCostUsd: message.data.total_cost_usd,
                    workspacePath: message.data.workspace_path,
                    generatedComponent: message.data.generated_component
                      ? {
                          name: message.data.generated_component.name,
                          filename: message.data.generated_component.filename,
                          sourceCode:
                            message.data.generated_component.source_code,
                          compiledCode:
                            message.data.generated_component.compiled_code,
                          filePath: message.data.generated_component.file_path,
                          compiledPath:
                            message.data.generated_component.compiled_path,
                          createdAt:
                            message.data.generated_component.created_at,
                          sizeBytes:
                            message.data.generated_component.size_bytes,
                        }
                      : undefined,
                  };

                  setResult(finalResult);

                  // Invalidate queries
                  queryClient.invalidateQueries([
                    AucctusQueryKeys.dynamicComponents,
                  ]);

                  if (
                    finalResult.status === 'success' &&
                    finalResult.generatedComponent
                  ) {
                    toast.success(
                      'Component Generated',
                      `${finalResult.generatedComponent.name} created successfully`,
                    );
                  } else if (finalResult.status === 'error') {
                    toast.error(
                      'Generation Failed',
                      finalResult.error || 'Failed to generate component',
                    );
                  }

                  resolve(finalResult);
                  break;

                case 'error':
                  setStatus('error');
                  const err = new Error(
                    message.data.error || 'Generation failed',
                  );
                  setError(err);
                  toast.error('Generation Failed', err.message);
                  reject(err);
                  break;
              }
            } catch (err) {
              // Silently ignore parse errors
            }
          };

          ws.onerror = () => {
            setStatus('error');
            const err = new Error('WebSocket connection error');
            setError(err);
            toast.error(
              'Connection Error',
              'Failed to connect to generation service',
            );
            reject(err);
          };

          ws.onclose = (event) => {
            if (status === 'streaming' || status === 'connected') {
              setStatus('disconnected');
            }

            // If closed before completion, treat as error
            if (!event.wasClean && status !== 'complete') {
              const err = new Error('Connection closed unexpectedly');
              setError(err);
              reject(err);
            }
          };
        });
      } catch (err) {
        setStatus('error');
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to generate component');
        setError(error);
        toast.error('Generation Failed', error.message);
        throw error;
      }
    },
    [cleanup, queryClient, messages, status],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    generate,
    reset,
    status,
    isConnecting: status === 'connecting',
    isConnected: status === 'connected',
    isStreaming: status === 'streaming',
    isComplete: status === 'complete',
    isLoading:
      status === 'connecting' ||
      status === 'connected' ||
      status === 'streaming',
    isError: status === 'error',
    isSuccess: status === 'complete' && !error,
    error,
    messages,
    result,
    // Convenience accessors
    sourceCode: result?.generatedComponent?.sourceCode ?? null,
    compiledCode: result?.generatedComponent?.compiledCode ?? null,
    componentName: result?.generatedComponent?.name ?? null,
    isGenerationSuccess: result?.status === 'success',
    cost: result?.totalCostUsd,
    duration: result?.durationMs,
  };
};
