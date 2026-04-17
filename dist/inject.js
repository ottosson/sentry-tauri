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
window.addEventListener('error', (event) => {
    Sentry.captureException(event.error ?? new Error(event.message));
});
window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    Sentry.captureException(reason instanceof Error ? reason : new Error(String(reason)));
});
