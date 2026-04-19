import * as Sentry from '@sentry/browser';
import { defaultOptions } from './';
window.Sentry = Sentry;
Sentry.init({
    ...defaultOptions,
    // We replace this with true or false before injecting this code into the browser
    debug: __DEBUG__,
});
// @sentry/browser v10's globalHandlersIntegration hooks via direct `window.onerror`
// assignment, which is non-additive and can be silently overwritten — in Tauri's
// WebView2 environment it doesn't reliably capture unhandled errors. addEventListener
// is additive and robust; Sentry's client dedupes, so any overlap is harmless.
//
// The captureException call is deferred via setTimeout because
// browserApiErrorsIntegration increments an internal sentinel counter when it
// wraps an error, and releases it via setTimeout(..., 0). captureException calls
// made while the counter is non-zero are silently dropped (the SDK returns an
// event ID but never sends an envelope). Deferring with setTimeout queues our
// capture after the sentinel's release, so the event actually reaches transport.
window.addEventListener('error', (event) => {
    const err = event.error ?? new Error(event.message);
    setTimeout(() => Sentry.captureException(err), 0);
});
window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const err = reason instanceof Error ? reason : new Error(String(reason));
    setTimeout(() => Sentry.captureException(err), 0);
});
