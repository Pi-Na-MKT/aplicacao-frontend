// Transforma um nome em slug: sem acentos, minúsculo e com hifens no lugar dos espaços.
// Ex.: "Café São João" -> "cafe-sao-joao"
export const toSlug = (name) =>
  name.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

// Mantém apenas os caracteres permitidos quando o usuário digita o slug manualmente.
export const sanitizeSlug = (value) => value.toLowerCase().replace(/[^a-z0-9-]/g, '')
