'use strict';

/**
 * Domain metrics calculations for text analysis and word statistics.
 */
const TextMetrics = {
  stopWords: new Set([
    'the', 'and', 'a', 'to', 'of', 'in', 'it', 'is', 'i', 'that',
    'for', 'you', 'was', 'with', 'on', 'as', 'have', 'but', 'be', 'they'
  ]),

  countWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/u).length;
  },

  countCharacters(text) {
    return text.length;
  },

  countCharactersNoSpaces(text) {
    return text.replace(/\s/g, '').length;
  },

  countSentences(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const sentences = trimmed.match(/[^.!?]+[.!?]+(\s|$)/g);
    return sentences ? sentences.length : (trimmed.length > 0 ? 1 : 0);
  },

  countParagraphs(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\n+/).filter(line => line.trim().length > 0).length;
  },

  calculateReadingTime(words) {
    if (words === 0) return '0 min';
    if (words < 100) return '< 1 min';
    const minutes = Math.ceil(words / 200);
    return `${minutes} min`;
  },

  calculateSpeakingTime(words) {
    if (words === 0) return '0 min';
    if (words < 60) return '< 1 min';
    const minutes = Math.ceil(words / 130);
    return `${minutes} min`;
  },

  toTitleCase(text) {
    return text.toLowerCase().replace(/(^|\s)\w/g, letter => letter.toUpperCase());
  },

  getTopKeywords(text, limit = 5) {
    const trimmed = text.trim();
    if (!trimmed) return [];
    const tokens = trimmed.toLowerCase().match(/\b[a-z]{3,}\b/g);
    if (!tokens) return [];

    const frequency = new Map();
    for (const token of tokens) {
      if (!this.stopWords.has(token)) {
        frequency.set(token, (frequency.get(token) || 0) + 1);
      }
    }

    return Array.from(frequency.entries())
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  }
};

