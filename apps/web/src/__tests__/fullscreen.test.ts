import assert from 'node:assert/strict';
import { test } from 'node:test';
import { supportsFullscreen } from '../lib/fullscreen';

test('requires both fullscreen permission and the document element API', () => {
    assert.equal(
        supportsFullscreen({
            fullscreenEnabled: true,
            documentElement: { async requestFullscreen() {} },
        }),
        true,
    );
});

test('allows browsers without fullscreen support to play without requesting it', () => {
    assert.equal(supportsFullscreen({ documentElement: {} }), false);
});

test('does not require fullscreen when the browser exposes a method but disables it', () => {
    assert.equal(
        supportsFullscreen({
            fullscreenEnabled: false,
            documentElement: {
                requestFullscreen() {
                    throw new Error('Fullscreen must not be requested');
                },
            },
        }),
        false,
    );
});

test('does not require fullscreen when the document element API is missing', () => {
    assert.equal(supportsFullscreen({ fullscreenEnabled: true, documentElement: {} }), false);
});
