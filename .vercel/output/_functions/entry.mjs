import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CzY8d1qz.mjs';
import { manifest } from './manifest_CbHXPpGI.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/export.astro.mjs');
const _page2 = () => import('./pages/api/generate.astro.mjs');
const _page3 = () => import('./pages/api/health.astro.mjs');
const _page4 = () => import('./pages/api/recommend.astro.mjs');
const _page5 = () => import('./pages/api/recommend-v2.astro.mjs');
const _page6 = () => import('./pages/api/review.astro.mjs');
const _page7 = () => import('./pages/api/schedule.astro.mjs');
const _page8 = () => import('./pages/api/stats.astro.mjs');
const _page9 = () => import('./pages/api/upload.astro.mjs');
const _page10 = () => import('./pages/dashboard.astro.mjs');
const _page11 = () => import('./pages/review.astro.mjs');
const _page12 = () => import('./pages/upload.astro.mjs');
const _page13 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/export.ts", _page1],
    ["src/pages/api/generate.ts", _page2],
    ["src/pages/api/health.ts", _page3],
    ["src/pages/api/recommend.ts", _page4],
    ["src/pages/api/recommend-v2.ts", _page5],
    ["src/pages/api/review.ts", _page6],
    ["src/pages/api/schedule.ts", _page7],
    ["src/pages/api/stats.ts", _page8],
    ["src/pages/api/upload.ts", _page9],
    ["src/pages/dashboard.astro", _page10],
    ["src/pages/review.astro", _page11],
    ["src/pages/upload.astro", _page12],
    ["src/pages/index.astro", _page13]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "f13d7662-e4ad-459c-917c-1839a12d08a5",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
