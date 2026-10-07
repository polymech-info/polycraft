import { getCollection } from 'astro:content';

export const GET = async ({ params, props }) => {
    const { item } = props;

    if (!item) {
        return new Response('Not found', { status: 404 });
    }

    const content = `
# ${item.data.title}

${item.data.description}

[View Original](${import.meta.env.SITE || ''}/${params.locale}/howtos/${item.slug})

---

${item.data.item.content || 'Content not available in markdown format.'}
  `.trim();

    return new Response(content, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};

export async function getStaticPaths() {
    const howtos = await getCollection('howtos');
    const locales = ['en'];

    return locales.flatMap(locale =>
        howtos.map(item => ({
            params: {
                locale,
                path: item.slug
            },
            props: { item },
        }))
    );
}
