import { describe, expect, it } from 'vitest';
import { VERSION } from './index.js';

describe('@topicmd/core', () => {
  it('exposes a version string', () => {
    expect(VERSION).toBe('0.0.0');
  });
});
