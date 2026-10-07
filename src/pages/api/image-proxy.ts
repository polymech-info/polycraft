import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url }) => {
    // Extract the full image URL from query parameters
    const searchParams = new URL(url).searchParams;
    const imageUrl = searchParams.get('url');
    if (!imageUrl) {
        return new Response('Missing image URL', { status: 400 });
    }

    try {
        // Fetch the image from Firebase
        const response = await fetch(imageUrl);

        if (!response.ok) {
            return new Response('Failed to fetch image', { status: response.status });
        }

        // Get the content type of the image
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Stream the image response
        return new Response(response.body, {
            headers: { 'Content-Type': contentType },
        });

    } catch (error) {
        return new Response('Error fetching image', { status: 500 });
    }
};
