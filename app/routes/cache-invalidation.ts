import { ActionFunctionArgs, json } from '@remix-run/cloudflare';

type WebhookBody = {
  entity_type: 'cda_cache_tags';
  event_type: 'invalidate';
  entity: {
    id: 'cda_cache_tags';
    type: 'cda_cache_tags';
    attributes: {
      tags: string[];
    };
  };
  related_entities: [];
};

async function invalidateFastlySurrogateKeys(
  serviceId: string,
  fastlyKey: string,
  keys: string[],
) {
  return fetch(`https://api.fastly.com/service/${serviceId}/purge`, {
    method: 'POST',
    headers: {
      'fastly-key': fastlyKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ surrogate_keys: keys }),
  });
}

export const action = async ({ request, context }: ActionFunctionArgs) => {
  if (request.method !== 'POST') {
    return json({ success: false }, 404);
  }

  if (
    request.headers.get('authorization') !==
    `Bearer ${context.cloudflare.env.CACHE_INVALIDATION_WEBHOOK_TOKEN}`
  ) {
    return json({ success: false }, 401);
  }

  const body = (await request.json()) as WebhookBody;
  const { tags } = body.entity.attributes;

  const response = await invalidateFastlySurrogateKeys(
    context.cloudflare.env.FASTLY_SERVICE_ID,
    context.cloudflare.env.FASTLY_KEY,
    tags,
  );

  if (!response.ok) {
    const responseBody = await response.json();
    return json(responseBody, response.status);
  }

  return json({ success: true }, response.status);
};
