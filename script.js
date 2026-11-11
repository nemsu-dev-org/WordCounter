'use strict';

/**
 * Domain metrics calculations for text analysis.
 */
const TextMetrics = {
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
  }
};

/**
 * UI Controller and DOM bindings.
 */
class WordCounterApp {
  constructor() {
    this.textInput = document.getElementById('text-input');
    this.wordCountEl = document.getElementById('word-count');
    this.charCountEl = document.getElementById('char-count');
    this.charNoSpacesEl = document.getElementById('char-no-spaces-count');
    this.sentenceCountEl = document.getElementById('sentence-count');
    this.paragraphCountEl = document.getElementById('paragraph-count');
    this.readingTimeEl = document.getElementById('reading-time');
    this.speakingTimeEl = document.getElementById('speaking-time');

    this.copyBtn = document.getElementById('copy-btn');
    this.copyText = document.getElementById('copy-text');
    this.pasteBtn = document.getElementById('paste-btn');
    this.clearBtn = document.getElementById('clear-btn');

    this.caseUpperBtn = document.getElementById('case-upper');
    this.caseLowerBtn = document.getElementById('case-lower');
    this.caseTitleBtn = document.getElementById('case-title');

    this.goalInput = document.getElementById('goal-input');
    this.goalContainer = document.getElementById('goal-progress-container');
    this.goalPercentEl = document.getElementById('goal-percent');
    this.goalBar = document.getElementById('goal-bar');
    this.goalProgressbar = document.getElementById('goal-progressbar');
    this.statusAnnouncement = document.getElementById('status-announcement');

    this.previouslyClearedText = '';

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateMetrics();
  }

  bindEvents() {
    this.textInput.addEventListener('input', () => this.updateMetrics());

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', () => this.handleClear());
    }

    if (this.copyBtn) {
      this.copyBtn.addEventListener('click', () => this.handleCopy());
    }

    if (this.pasteBtn) {
      this.pasteBtn.addEventListener('click', () => this.handlePaste());
    }

    if (this.caseUpperBtn) {
      this.caseUpperBtn.addEventListener('click', () => this.transformText(text => text.toUpperCase()));
    }

    if (this.caseLowerBtn) {
      this.caseLowerBtn.addEventListener('click', () => this.transformText(text => text.toLowerCase()));
    }

    if (this.caseTitleBtn) {
      this.caseTitleBtn.addEventListener('click', () => this.transformText(text => TextMetrics.toTitleCase(text)));
    }

    if (this.goalInput) {
      this.goalInput.addEventListener('input', () => this.updateGoalProgress());
    }
  }

  updateMetrics() {
    const text = this.textInput.value;
    const hasText = text.trim().length > 0;
    const words = TextMetrics.countWords(text);
    const chars = TextMetrics.countCharacters(text);
    const charsNoSpaces = TextMetrics.countCharactersNoSpaces(text);
    const sentences = TextMetrics.countSentences(text);
    const paragraphs = TextMetrics.countParagraphs(text);

    this.wordCountEl.textContent = words.toLocaleString();
    this.charCountEl.textContent = chars.toLocaleString();
    this.charNoSpacesEl.textContent = charsNoSpaces.toLocaleString();
    this.sentenceCountEl.textContent = sentences.toLocaleString();
    this.paragraphCountEl.textContent = paragraphs.toLocaleString();

    this.readingTimeEl.textContent = TextMetrics.calculateReadingTime(words);
    this.speakingTimeEl.textContent = TextMetrics.calculateSpeakingTime(words);

    if (this.copyBtn) this.copyBtn.disabled = !hasText;
    if (this.clearBtn) this.clearBtn.disabled = !hasText && !this.previouslyClearedText;
    if (this.caseUpperBtn) this.caseUpperBtn.disabled = !hasText;
    if (this.caseLowerBtn) this.caseLowerBtn.disabled = !hasText;
    if (this.caseTitleBtn) this.caseTitleBtn.disabled = !hasText;

    this.updateGoalProgress(words);
  }

  updateGoalProgress(currentWords) {
    if (!this.goalInput || !this.goalContainer) return;

    const goal = parseInt(this.goalInput.value, 10);
    if (!goal || goal <= 0) {
      this.goalContainer.hidden = true;
      return;
    }

    this.goalContainer.hidden = false;
    const words = currentWords !== undefined ? currentWords : TextMetrics.countWords(this.textInput.value);
    const percentage = Math.min(100, Math.round((words / goal) * 100));

    this.goalPercentEl.textContent = `${percentage}% (${words} / ${goal})`;
    this.goalBar.style.width = `${percentage}%`;
    this.goalProgressbar.setAttribute('aria-valuenow', percentage.toString());

    if (percentage >= 100) {
      this.goalBar.classList.add('goal-reached');
    } else {
      this.goalBar.classList.remove('goal-reached');
    }
  }

  transformText(transformer) {
    const text = this.textInput.value;
    if (!text) return;

    this.textInput.value = transformer(text);
    this.updateMetrics();
    this.announce('Text transformed');
  }

  async handleCopy() {
    const text = this.textInput.value;
    if (!text) {
      this.announce('No text to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      const originalText = this.copyText.textContent;
      this.copyText.textContent = 'Copied';
      this.announce('Text copied to clipboard');

      setTimeout(() => {
        this.copyText.textContent = originalText;
      }, 1500);
    } catch (err) {
      this.announce('Failed to copy to clipboard');
    }
  }

  async handlePaste() {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (!clipboardText) return;

      const start = this.textInput.selectionStart;
      const end = this.textInput.selectionEnd;
      const current = this.textInput.value;

      this.textInput.value = current.substring(0, start) + clipboardText + current.substring(end);
      this.textInput.selectionStart = this.textInput.selectionEnd = start + clipboardText.length;
      this.updateMetrics();
      this.textInput.focus();
      this.announce('Text pasted from clipboard');
    } catch (err) {
      this.announce('Clipboard permission denied or unavailable');
    }
  }

  handleClear() {
    if (!this.textInput.value) {
      if (this.previouslyClearedText) {
        this.textInput.value = this.previouslyClearedText;
        this.previouslyClearedText = '';
        this.updateMetrics();
        this.textInput.focus();
        this.announce('Text restored');
      }
      return;
    }

    this.previouslyClearedText = this.textInput.value;
    this.textInput.value = '';
    this.updateMetrics();
    this.textInput.focus();
    this.announce('Text cleared. Click clear again to undo.');
  }

  announce(message) {
    if (!this.statusAnnouncement) return;
    this.statusAnnouncement.textContent = message;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WordCounterApp();
});
