import 'piccolore';
import { o as decodeKey } from './chunks/astro/server_y1XpGNYX.mjs';
import 'clsx';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Id5NDMBP.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/liangliang.sun/child-learn-system/","cacheDir":"file:///Users/liangliang.sun/child-learn-system/node_modules/.astro/","outDir":"file:///Users/liangliang.sun/child-learn-system/dist/","srcDir":"file:///Users/liangliang.sun/child-learn-system/src/","publicDir":"file:///Users/liangliang.sun/child-learn-system/public/","buildClientDir":"file:///Users/liangliang.sun/child-learn-system/dist/client/","buildServerDir":"file:///Users/liangliang.sun/child-learn-system/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/export","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/export\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"export","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/export.ts","pathname":"/api/export","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/generate","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/generate\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"generate","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/generate.ts","pathname":"/api/generate","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/health","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/health\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"health","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/health.ts","pathname":"/api/health","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/recommend","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/recommend\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"recommend","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/recommend.ts","pathname":"/api/recommend","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/recommend-v2","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/recommend-v2\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"recommend-v2","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/recommend-v2.ts","pathname":"/api/recommend-v2","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/review","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/review\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"review","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/review.ts","pathname":"/api/review","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/schedule","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/schedule\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"schedule","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/schedule.ts","pathname":"/api/schedule","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/stats","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/stats\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"stats","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/stats.ts","pathname":"/api/stats","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/upload","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/upload\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"upload","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/upload.ts","pathname":"/api/upload","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/dashboard.DntIJ0BS.css"}],"routeData":{"route":"/dashboard","isIndex":false,"type":"page","pattern":"^\\/dashboard\\/?$","segments":[[{"content":"dashboard","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/dashboard.astro","pathname":"/dashboard","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/dashboard.DntIJ0BS.css"}],"routeData":{"route":"/review","isIndex":false,"type":"page","pattern":"^\\/review\\/?$","segments":[[{"content":"review","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/review.astro","pathname":"/review","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/dashboard.DntIJ0BS.css"}],"routeData":{"route":"/upload","isIndex":false,"type":"page","pattern":"^\\/upload\\/?$","segments":[[{"content":"upload","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/upload.astro","pathname":"/upload","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/dashboard.DntIJ0BS.css"},{"type":"inline","content":"body{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}\n"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/liangliang.sun/child-learn-system/src/pages/dashboard.astro",{"propagation":"none","containsHead":true}],["/Users/liangliang.sun/child-learn-system/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/liangliang.sun/child-learn-system/src/pages/review.astro",{"propagation":"none","containsHead":true}],["/Users/liangliang.sun/child-learn-system/src/pages/upload.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/export@_@ts":"pages/api/export.astro.mjs","\u0000@astro-page:src/pages/api/generate@_@ts":"pages/api/generate.astro.mjs","\u0000@astro-page:src/pages/api/health@_@ts":"pages/api/health.astro.mjs","\u0000@astro-page:src/pages/api/recommend@_@ts":"pages/api/recommend.astro.mjs","\u0000@astro-page:src/pages/api/recommend-v2@_@ts":"pages/api/recommend-v2.astro.mjs","\u0000@astro-page:src/pages/api/review@_@ts":"pages/api/review.astro.mjs","\u0000@astro-page:src/pages/api/schedule@_@ts":"pages/api/schedule.astro.mjs","\u0000@astro-page:src/pages/api/stats@_@ts":"pages/api/stats.astro.mjs","\u0000@astro-page:src/pages/api/upload@_@ts":"pages/api/upload.astro.mjs","\u0000@astro-page:src/pages/dashboard@_@astro":"pages/dashboard.astro.mjs","\u0000@astro-page:src/pages/review@_@astro":"pages/review.astro.mjs","\u0000@astro-page:src/pages/upload@_@astro":"pages/upload.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_CbHXPpGI.mjs","/Users/liangliang.sun/child-learn-system/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_Bx9yHxBW.mjs","/Users/liangliang.sun/child-learn-system/src/components/Dashboard":"_astro/Dashboard.BgY9tIqY.js","/Users/liangliang.sun/child-learn-system/src/components/ReviewPage":"_astro/ReviewPage.BK0iHOEP.js","/Users/liangliang.sun/child-learn-system/src/components/UploadForm":"_astro/UploadForm.BNKAiGQE.js","@astrojs/react/client.js":"_astro/client.DQ0Z8FZJ.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/dashboard.DntIJ0BS.css","/_astro/Dashboard.BgY9tIqY.js","/_astro/ReviewPage.BK0iHOEP.js","/_astro/UploadForm.BNKAiGQE.js","/_astro/client.DQ0Z8FZJ.js","/_astro/index.DK-fsZOb.js","/_astro/jsx-runtime.ClP7wGfN.js"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"ZsawVE1uTqLyonlQ6VPfyonJy3tscQCKUTGrcO4L/mw="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
