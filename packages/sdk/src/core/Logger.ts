/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Pipeline log level controls verbosity of transaction execution logs.
 *
 *   'silent'  — no pipeline output
 *   'normal'  — operation start/end + errors (default)
 *   'verbose' — normal + every pipeline step
 *
 * Set via:
 *   - env var  SDK_LOG_LEVEL=silent|normal|verbose
 *   - env var  SDK_LOG=0 (silent) | SDK_LOG=1 (verbose)
 *   - runtime  logger.setLevel('verbose')
 */
export type PipelineLogLevel = 'silent' | 'normal' | 'verbose';

let level: PipelineLogLevel = (() => {
  const envLevel = process.env.SDK_LOG_LEVEL as PipelineLogLevel | undefined;
  if (envLevel === 'silent' || envLevel === 'normal' || envLevel === 'verbose') return envLevel;
  if (process.env.SDK_LOG === '0') return 'silent';
  if (process.env.SDK_LOG === '1') return 'verbose';
  return process.env.NODE_ENV === 'test' ? 'silent' : 'normal';
})();

export const logger = {
  /** Operation-level logs (start, success, error). Shown at 'normal' and 'verbose'. */
  info:    (msg: string): void => { if (level !== 'silent') console.log(`[SDK] ${msg}`); },
  /** Error logs. Always shown unless 'silent'. */
  error:   (msg: string): void => { if (level !== 'silent') console.error(`[SDK:ERR] ${msg}`); },
  /** Step-level detail (each pipeline step). Only shown at 'verbose'. */
  step:    (msg: string): void => { if (level === 'verbose') console.log(`[SDK] ${msg}`); },
  /** Change level at runtime. */
  setLevel: (l: PipelineLogLevel): void => { level = l; },
  /** Get current level. */
  getLevel: (): PipelineLogLevel => level,
};

/** Mask a key/hex string showing only first 6 and last 4 chars: 0x33ac...d7e4 */
export function maskKey(key: string): string {
  if (!key || key.length < 16) return '***';
  return `${key.slice(0, 6)}...${key.slice(-4)}`;
}
