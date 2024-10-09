export function uppercaseFirstLetter(text: string) {
  return replaceFirstLetter(text, (letter) => letter.toUpperCase());
}

export function lowercaseFirstLetter(text: string) {
  return replaceFirstLetter(text, (letter) => letter.toLowerCase());
}

export function replaceFirstLetter(
  text: string,
  replacer: (letter: string) => string,
) {
  if (!text) {
    return "";
  }
  if (text.length === 1) {
    return replacer(text);
  }
  return `${replacer(text.substring(0, 1))}${text.substring(1)}`;
}
