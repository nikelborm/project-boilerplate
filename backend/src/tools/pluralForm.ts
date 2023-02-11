export const pluralForm = (word: string): string =>
  word[word.length - 1] === 'y' ? `${word}ies` : `${word}s`;
