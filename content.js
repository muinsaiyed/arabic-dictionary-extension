console.log('Arabic Hover Dictionary: Content script loaded');

// Create and style the tooltip
const tooltip = document.createElement('div');
tooltip.style.cssText = `
  position: fixed;
  background-color: #2c3e50;
  color: #ecf0f1;
  padding: 15px;
  border-radius: 8px;
  font-size: 14px;
  max-width: 300px;
  min-width: 200px;
  z-index: 9999999;
  display: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  line-height: 1.4;
  text-align: left;  /* Ensure left alignment */
`;
document.body.appendChild(tooltip);

// Create a highlight element
const highlight = document.createElement('div');
highlight.style.cssText = `
  position: absolute;
  background-color: yellow;
  opacity: 0.5;
  pointer-events: none;
  display: none;
`;
document.body.appendChild(highlight);

// Cache object
const cache = {};

let currentWord = null;
let currentPosition = { x: 0, y: 0 };

// Function to handle mousemove
function handleMouseMove(e) {
  currentPosition.x = e.clientX;
  currentPosition.y = e.clientY;
  const element = document.elementFromPoint(e.clientX, e.clientY);
  if (element && element.textContent) {
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (range) {
      const word = getWordAtPoint(range);
      if (word && /[\u0600-\u06FF]/.test(word)) {
        currentWord = word;
        const rect = range.getBoundingClientRect();
        highlight.style.left = `${rect.left + window.scrollX}px`;
        highlight.style.top = `${rect.top + window.scrollY}px`;
        highlight.style.width = `${rect.width}px`;
        highlight.style.height = `${rect.height}px`;
        highlight.style.display = 'block';
      } else {
        currentWord = null;
        hideHighlight();
      }
    }
  } else {
    currentWord = null;
    hideHighlight();
  }
}

function hideHighlight() {
  highlight.style.display = 'none';
}

function hideTooltip() {
  tooltip.style.display = 'none';
}

// Function to get the word at a specific point
function getWordAtPoint(range) {
  if (range) {
    range.expand('word');
    return range.toString().trim();
  }
  return null;
}

// Function to position the tooltip
function positionTooltip() {
  const tooltipRect = tooltip.getBoundingClientRect();
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  let left = currentPosition.x + 10;
  let top = currentPosition.y + 10;

  if (left + tooltipRect.width > windowWidth) {
    left = windowWidth - tooltipRect.width - 10;
  }

  if (top + tooltipRect.height > windowHeight) {
    top = currentPosition.y - tooltipRect.height - 10;
  }

  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}

// Function to translate word
function translateWord(word) {
  tooltip.innerHTML = `<div style="color: #bdc3c7;">Translating...</div>`;
  positionTooltip();
  tooltip.style.display = 'block';

  if (cache[word]) {
    displayTranslation(cache[word]);
  } else {
    chrome.runtime.sendMessage({action: 'translate', text: word}, response => {
      if (response.error) {
        tooltip.innerHTML = `<div style="color: #e74c3c;">Error: ${response.error}</div>`;
      } else {
        cache[word] = response.translation;
        displayTranslation(response.translation);
      }
    });
  }
}

function displayTranslation(translation) {
  // Split the translation and explanation
  let [translationText, explanation] = translation.split('Explanation:');
  
  // Clean up the translation text
  translationText = translationText.replace('Translation:', '').trim().replace(/^["']|["']$/g, '');
  
  // Clean up the explanation
  explanation = explanation.trim();
  
  // Ensure the explanation ends with proper punctuation
  if (!/[.!?]$/.test(explanation)) {
    explanation += '.';
  }

  tooltip.innerHTML = `
    <div style="margin-bottom: 8px; text-align: left;">
      <span style="color: #3498db; font-weight: bold;">Translation:</span> ${translationText}
    </div>
    <div style="text-align: left;">
      <span style="color: #3498db; font-weight: bold;">Explanation:</span> ${explanation}
    </div>
  `;
  positionTooltip();
}

// Function to handle keyboard shortcut
function handleKeyPress(e) {
  // Check if Ctrl+Shift+Space is pressed
  if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
    e.preventDefault(); // Prevent default space bar behavior
    if (currentWord) {
      translateWord(currentWord);
    }
  }
}

// Add event listeners
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('click', hideTooltip);

console.log('Arabic Hover Dictionary: Event listeners added');