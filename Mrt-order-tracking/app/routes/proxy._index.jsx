import {authenticate} from '../shopify.server.js';

export async function loader({request}) {
  const {
    admin,
    session,
  } = await authenticate.public.appProxy(request);

  const allPage = await admin.rest.resources.Page.all({
    session: session,
  });
  const url = new URL(request.url);
  const params = new URLSearchParams(url.search);

  const config = {
    headers: {
      'Content-Type': 'application/liquid',
    },
  };

  const content = `{% section 'page' %}`;

  return new Response(content, config);
}
