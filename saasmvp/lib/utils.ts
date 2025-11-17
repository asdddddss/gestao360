
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose accented characters into base characters and diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove the diacritics
    .replace(/[^\w\s-]/g, '') // Remove remaining non-word characters (except spaces and hyphens)
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};
