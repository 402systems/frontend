export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    let deployId = pathSegments[0]; // e.g., "marketing-blog"
    let assetPath = pathSegments.slice(1).join('/');

    if (!deployId) {
      deployId = '_root';
      assetPath = pathSegments.join('/');
    }

    const environment = url.hostname.startsWith('staging')
      ? 'staging'
      : 'production';

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
