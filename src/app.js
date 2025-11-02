// app.js - Simplified PV157 Quiz
// All logic in one file

// ==================== STATE ====================
let allQuestions = [];
let filteredQuestions = [];
let currentIndex = 0;
let orderMode = 'sequential'; // 'sequential' or 'random'
let randomOrder = [];
let sequentialIndex = 0; // For tracking position in sequential mode

// Settings
let settings = {
  showCategories: true,
  showAnswerCount: true,
  showStats: true,
  saveStats: true
};

// ==================== STORAGE ====================

function saveStats(questionId, correct) {
  if (!settings.saveStats) return;
  
  const stats = getStats();
  if (!stats[questionId]) {
    stats[questionId] = { correct: 0, wrong: 0 };
  }
  
  if (correct) {
    stats[questionId].correct++;
  } else {
    stats[questionId].wrong++;
  }
  
  saveStatsToStorage(stats);
}

function getStats() {
  const data = localStorage.getItem('pv157_stats');
  return data ? JSON.parse(data) : {};
}

function saveStatsToStorage(stats) {
  localStorage.setItem('pv157_stats', JSON.stringify(stats));
}

function clearAllStats() {
  localStorage.removeItem('pv157_stats');
}

function getQuestionStats(questionId) {
  const stats = getStats();
  return stats[questionId] || { correct: 0, wrong: 0 };
}

function saveSettings() {
  localStorage.setItem('pv157_settings', JSON.stringify(settings));
}

function loadSettings() {
  const data = localStorage.getItem('pv157_settings');
  if (data) {
    settings = { ...settings, ...JSON.parse(data) };
  }
}

// ==================== FILTERING ====================

function applyFilters() {
  const selectedCategories = Array.from(
    document.querySelectorAll('#category-filters input:checked')
  ).map(input => input.value);
  
  const selectedTypes = Array.from(
    document.querySelectorAll('input[name="type-filter"]:checked')
  ).map(input => input.value);
  
  const wrongFilter = document.getElementById('filter-wrong').checked;
  const wrongThreshold = parseInt(document.getElementById('wrong-threshold').value) || 2;
  
  filteredQuestions = allQuestions.filter(q => {
    // Category filter
    if (!q.categories.some(cat => selectedCategories.includes(cat))) {
      return false;
    }
    
    // Type filter
    if (!selectedTypes.includes(q.type)) {
      return false;
    }
    
    // Wrong count filter
    if (wrongFilter) {
      const stats = getQuestionStats(q.id);
      if (stats.wrong < wrongThreshold) {
        return false;
      }
    }
    
    return true;
  });
  
  // Reset navigation
  if (orderMode === 'random') {
    generateRandomOrder();
  } else {
    sequentialIndex = 0;
  }
  currentIndex = 0;
  
  if (filteredQuestions.length > 0) {
    showQuestion();
  } else {
    showNoQuestions();
  }
}

function generateRandomOrder() {
  randomOrder = Array.from({ length: filteredQuestions.length }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = randomOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomOrder[i], randomOrder[j]] = [randomOrder[j], randomOrder[i]];
  }
}

// ==================== RENDERING ====================

function showQuestion() {
  if (filteredQuestions.length === 0) {
    showNoQuestions();
    return;
  }
  
  const questionIndex = orderMode === 'random' 
    ? randomOrder[currentIndex] 
    : currentIndex;
  
  const question = filteredQuestions[questionIndex];
  const stats = getQuestionStats(question.id);
  const container = document.getElementById('question-container');
  
  // Build question HTML
  const metaInfo = [];
  if (settings.showCategories) {
    metaInfo.push(`<span class="badge">${question.categories.join(', ')}</span>`);
  }
  if (settings.showAnswerCount) {
    const correctCount = question.answers.filter(a => a.right).length;
    metaInfo.push(`<span class="badge">${correctCount} správné</span>`);
  }
  if (settings.showStats && (stats.correct > 0 || stats.wrong > 0)) {
    metaInfo.push(`<span class="stat-correct">✓ ${stats.correct}</span>`);
    metaInfo.push(`<span class="stat-wrong">✗ ${stats.wrong}</span>`);
  }
  
  container.innerHTML = `
    <div class="question-card">
      ${metaInfo.length > 0 ? `<div class="question-meta">${metaInfo.join(' ')}</div>` : ''}
      
      <h2 class="question-text">${question.name}</h2>
      
      <form class="answers-form" id="answers-form">
        ${question.answers.map((answer, idx) => `
          <label class="answer-option" data-index="${idx}">
            <input 
              type="${question.type === 'single' ? 'radio' : 'checkbox'}" 
              name="answer" 
              value="${idx}"
            >
            <span>${answer.body}</span>
          </label>
        `).join('')}
      </form>
      
      <div class="question-actions">
        <button class="btn btn-primary" id="btn-evaluate">Vyhodnotit odpověď</button>
        <button class="btn" id="btn-show-answer">Zobrazit odpověď</button>
      </div>
      
      <div class="feedback" id="feedback"></div>
    </div>
  `;
  
  // Setup button handlers
  document.getElementById('btn-evaluate').addEventListener('click', evaluateAnswer);
  document.getElementById('btn-show-answer').addEventListener('click', showAnswer);
  
  updateCounter();
}

function evaluateAnswer() {
  const form = document.getElementById('answers-form');
  const selected = Array.from(form.querySelectorAll('input:checked')).map(inp => parseInt(inp.value));
  
  if (selected.length === 0) {
    alert('Vyber alespoň jednu odpověď!');
    return;
  }
  
  const questionIndex = orderMode === 'random' 
    ? randomOrder[currentIndex] 
    : currentIndex;
  const question = filteredQuestions[questionIndex];
  
  const correct = checkAnswer(question, selected);
  
  // Save stats - evaluateAnswer ukládá
  saveStats(question.id, correct);
  
  // Show feedback
  displayFeedback(question, selected, correct);
  
  // Disable inputs
  form.querySelectorAll('input').forEach(inp => inp.disabled = true);
  document.getElementById('btn-evaluate').disabled = true;
  document.getElementById('btn-show-answer').disabled = true;
}

function showAnswer() {
  const questionIndex = orderMode === 'random' 
    ? randomOrder[currentIndex] 
    : currentIndex;
  const question = filteredQuestions[questionIndex];
  
  const correctIndices = question.answers
    .map((ans, idx) => ans.right ? idx : -1)
    .filter(idx => idx !== -1);
  
  // Highlight correct answers
  const form = document.getElementById('answers-form');
  form.querySelectorAll('.answer-option').forEach((option, idx) => {
    if (correctIndices.includes(idx)) {
      option.classList.add('answer-correct');
    }
  });
  
  form.querySelectorAll('input').forEach(inp => inp.disabled = true);
  document.getElementById('btn-evaluate').disabled = true;
  document.getElementById('btn-show-answer').disabled = true;
}

function checkAnswer(question, selectedIndices) {
  const correctIndices = question.answers
    .map((ans, idx) => ans.right ? idx : -1)
    .filter(idx => idx !== -1);
  
  const selectedSet = new Set(selectedIndices);
  const correctSet = new Set(correctIndices);
  
  // Check if fully correct
  return selectedSet.size === correctSet.size &&
    [...selectedSet].every(idx => correctSet.has(idx));
}

function displayFeedback(question, selectedIndices, isCorrect) {
  const correctIndices = question.answers
    .map((ans, idx) => ans.right ? idx : -1)
    .filter(idx => idx !== -1);
  
  const feedback = document.getElementById('feedback');
  const correctAnswers = correctIndices.map(idx => question.answers[idx].body).join(', ');
  
  feedback.innerHTML = `
    <div class="feedback-box ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}">
      ${isCorrect ? '✓ Správně!' : '✗ Špatně'}
      ${!isCorrect ? `<div class="feedback-detail">Správné odpovědi: ${correctAnswers}</div>` : ''}
    </div>
  `;
  
  // Highlight answers
  const form = document.getElementById('answers-form');
  form.querySelectorAll('.answer-option').forEach((option, idx) => {
    const isSelected = selectedIndices.includes(idx);
    const isCorrectAnswer = correctIndices.includes(idx);
    
    if (isCorrectAnswer) {
      option.classList.add('answer-correct');
    }
    if (isSelected && !isCorrectAnswer) {
      option.classList.add('answer-wrong');
    }
  });
}

function showNoQuestions() {
  document.getElementById('question-container').innerHTML = `
    <div class="info">
      <p>❌ Žádné otázky nevyhovují filtru.</p>
      <p>Zkus změnit nastavení filtrů.</p>
    </div>
  `;
  updateCounter();
}

// ==================== NAVIGATION ====================

function nextQuestion() {
  // Auto-evaluate if not evaluated yet
  const form = document.getElementById('answers-form');
  if (form && !form.querySelector('input:disabled')) {
    const selected = Array.from(form.querySelectorAll('input:checked')).map(inp => parseInt(inp.value));
    if (selected.length > 0) {
      evaluateAnswer();
      return; // Don't navigate yet, let user see feedback
    }
  }
  
  if (currentIndex < filteredQuestions.length - 1) {
    currentIndex++;
    showQuestion();
  }
}

function prevQuestion() {
  if (currentIndex > 0) {
    currentIndex--;
    showQuestion();
  }
}

function updateCounter() {
  const counter = document.getElementById('counter');
  counter.textContent = `${currentIndex + 1} / ${filteredQuestions.length}`;
  
  document.getElementById('btn-prev').disabled = currentIndex === 0 || filteredQuestions.length === 0;
  document.getElementById('btn-next').disabled = currentIndex >= filteredQuestions.length - 1 || filteredQuestions.length === 0;
}

function changeOrderMode() {
  const newMode = document.getElementById('order-select').value;
  
  if (newMode === orderMode) return;
  
  if (newMode === 'random') {
    // Switch from sequential to random
    sequentialIndex = currentIndex; // Remember where we were
    generateRandomOrder();
    currentIndex = 0;
  } else {
    // Switch from random to sequential
    currentIndex = sequentialIndex; // Go back to where we were
  }
  
  orderMode = newMode;
  showQuestion();
}

// ==================== SETTINGS ====================

function openSettings() {
  document.getElementById('settings-panel').classList.add('active');
}

function closeSettings() {
  document.getElementById('settings-panel').classList.remove('active');
}

function updateSettingsUI() {
  document.getElementById('setting-show-categories').checked = settings.showCategories;
  document.getElementById('setting-show-answer-count').checked = settings.showAnswerCount;
  document.getElementById('setting-show-stats').checked = settings.showStats;
  document.getElementById('setting-save-stats').checked = settings.saveStats;
}

function attachSettingsListeners() {
  document.getElementById('setting-show-categories').addEventListener('change', (e) => {
    settings.showCategories = e.target.checked;
    saveSettings();
    showQuestion();
  });
  
  document.getElementById('setting-show-answer-count').addEventListener('change', (e) => {
    settings.showAnswerCount = e.target.checked;
    saveSettings();
    showQuestion();
  });
  
  document.getElementById('setting-show-stats').addEventListener('change', (e) => {
    settings.showStats = e.target.checked;
    saveSettings();
    showQuestion();
  });
  
  document.getElementById('setting-save-stats').addEventListener('change', (e) => {
    settings.saveStats = e.target.checked;
    saveSettings();
  });
}

// ==================== INITIALIZATION ====================

async function init() {
  try {
    // Load questions
    const response = await fetch('./questions.json');
    allQuestions = await response.json();
    
    console.log(`✅ Loaded ${allQuestions.length} questions`);
    
    // Load settings
    loadSettings();
    updateSettingsUI();
    
    // Setup category filters
    const categories = [...new Set(allQuestions.flatMap(q => q.categories))].sort();
    const categoryContainer = document.getElementById('category-filters');
    categoryContainer.innerHTML = categories.map(cat => `
      <label><input type="checkbox" value="${cat}" checked> ${cat}</label>
    `).join('');
    
    // Attach event listeners
    document.getElementById('btn-settings').addEventListener('click', openSettings);
    document.getElementById('btn-close-settings').addEventListener('click', closeSettings);
    document.getElementById('btn-clear-stats').addEventListener('click', () => {
      if (confirm('Opravdu smazat všechny statistiky?')) {
        clearAllStats();
        showQuestion(); // Refresh display
      }
    });
    
    document.getElementById('btn-prev').addEventListener('click', prevQuestion);
    document.getElementById('btn-next').addEventListener('click', nextQuestion);
    document.getElementById('order-select').addEventListener('change', changeOrderMode);
    
    // Filter change listeners
    categoryContainer.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('change', applyFilters);
    });
    
    document.querySelectorAll('input[name="type-filter"]').forEach(inp => {
      inp.addEventListener('change', applyFilters);
    });
    
    document.getElementById('filter-wrong').addEventListener('change', applyFilters);
    document.getElementById('wrong-threshold').addEventListener('change', applyFilters);
    
    attachSettingsListeners();
    
    // Initial filter and display
    applyFilters();
    
  } catch (error) {
    console.error('Failed to load questions:', error);
    document.getElementById('question-container').innerHTML = `
      <div class="info error">
        <p>❌ Chyba při načítání otázek</p>
        <p>Zkontroluj konzoli pro více informací.</p>
      </div>
    `;
  }
}

// Start the app
init();