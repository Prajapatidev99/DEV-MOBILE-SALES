export const createSlug = (name: string, id: number | string): string => {
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/(^-|-$)+/g, ''); // Remove leading/trailing hyphens
    
    return `${slug}-${id}`;
};

export const getIdFromSlug = (slug: string): number => {
    if (!slug) return 0;
    // Split by hyphen and take the last part (which is the ID)
    const parts = slug.split('-');
    const idString = parts[parts.length - 1];
    const id = parseInt(idString, 10);
    return isNaN(id) ? 0 : id;
};
