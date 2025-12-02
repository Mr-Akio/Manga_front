export const getImageUrl = (path: string | null | undefined) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://manga-backend-635l.onrender.com';
    return `${baseUrl}${path}`;
};
