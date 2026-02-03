export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    // Default to core/home if no path specified (e.g., root URL)
    const deployId = pathSegments[0] || 'core/home';
    const environment = url.hostname.startsWith('staging')
      ? 'staging'
      : 'production';

    let assetPath = pathSegments.slice(1).join('/');
    if (!assetPath || !assetPath.includes('.')) {
      // Ensure we don't end up with double slashes
      assetPath = assetPath ? `${assetPath}/index.html` : 'index.html';
    }
    const r2Key = `${environment}/${deployId}/${assetPath}`;

    const object = await env.DEPLOYMENTS_BUCKET.get(r2Key);
    if (!object)
      return new Response(`File not found in R2: ${r2Key}`, { status: 404 });

    // 4. Return with correct headers
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  },
} satisfies ExportedHandler<Env>;
