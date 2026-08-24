const DATA_URL = './data/questoes-demo.json';
const STORAGE_KEY = 'ifsuldeminas-simulados:mvp-v1';

const state = {
  bank: [],
  questions: [],
  answers: {},
  reviews: {},
  reviewReasons: {},
  startedAt: null,
  finishedAt: null,
  timerHandle: null,
  finalized: false,
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => [...document.querySelectorAll(sel)];

function normalizePayload(payload) {
  return Array.isArray(payload) ? payload : (payload.questoes || payload.questions || []);
}

function shuffle(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = String(Math.floor(total / 60)).padStart(2, '0');
  const sec = String(total % 60).padStart(2, '0');
  return `${min}:${sec}`;
}

function updateTimer() {
  if (!state.startedAt) return;
  const end = state.finishedAt || Date.now();
  $('#timer').textContent = formatTime(end - state.startedAt);
}

function startTimer() {
  clearInterval(state.timerHandle);
  updateTimer();
  state.timerHandle = setInterval(updateTimer, 1000);
}

function stopTimer() {
  clearInterval(state.timerHandle);
  state.timerHandle = null;
  updateTimer();
}

function selectedDisciplines() {
  return $$('#discipline-options input:checked').map(el => el.value);
}

function renderConfig() {
  const disciplines = [...new Set(state.bank.map(q => q.disciplina))];
  $('#discipline-options').innerHTML = disciplines.map(d => `
    <label class="chip">
      <input type="checkbox" value="${escapeHtml(d)}" checked>
      <span>${escapeHtml(d)}</span>
    </label>
  `).join('');

  const max = state.bank.length;
  const opts = [...Array(max)].map((_, i) => i + 1);
  $('#quantity').innerHTML = opts.map(n => `<option value="${n}" ${n === max ? 'selected' : ''}>${n}</option>`).join('');

  $('#discipline-options').addEventListener('change', syncQuantityOptions);
  syncQuantityOptions();

  const saved = localStorage.getItem(STORAGE_KEY);
  $('#resume-btn').classList.toggle('hidden', !saved);
}

function syncQuantityOptions() {
  const selected = selectedDisciplines();
  const available = state.bank.filter(q => selected.includes(q.disciplina)).length;
  const current = Number($('#quantity').value || available);
  $('#quantity').innerHTML = [...Array(available)].map((_, i) => {
    const n = i + 1;
    return `<option value="${n}" ${n === Math.min(current, available) ? 'selected' : ''}>${n}</option>`;
  }).join('');
}

function createQuiz() {
  const disciplines = selectedDisciplines();
  if (!disciplines.length) {
    $('#config-message').textContent = 'Escolha pelo menos uma disciplina.';
    return;
  }
  $('#config-message').textContent = '';
  let pool = state.bank.filter(q => disciplines.includes(q.disciplina) && String(q.situacao).toLowerCase() !== 'anulada');
  const quantity = Math.min(Number($('#quantity').value), pool.length);
  if ($('#order').value === 'random') pool = shuffle(pool);
  state.questions = pool.slice(0, quantity);
  state.answers = {};
  state.reviews = {};
  state.reviewReasons = {};
  state.startedAt = Date.now();
  state.finishedAt = null;
  state.finalized = false;
  showQuiz();
  saveState();
}

function showQuiz() {
  $('#config').classList.add('hidden');
  $('#results').classList.add('hidden');
  $('#quiz').classList.remove('hidden');
  renderQuestions();
  startTimer();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderQuestions() {
  $('#questions').innerHTML = state.questions.map((q, idx) => questionTemplate(q, idx)).join('');
  hydrateResponses();
  updateProgress();

  $('#questions').addEventListener('change', onQuestionChange);
  $('#questions').addEventListener('input', onReasonInput);
}

function questionTemplate(q, idx) {
  const alternatives = Object.entries(q.alternativas || {});
  const meta = [q.id, q.disciplina, q.nivel_2, `${q.origem?.instituicao || ''}/${q.origem?.ano || ''}`].filter(Boolean);
  return `
    <article class="panel question-card" data-qid="${escapeHtml(q.id)}" id="q-${idx + 1}">
      <div class="question-meta">${meta.map(x => `<span class="badge">${escapeHtml(String(x))}</span>`).join('')}</div>
      <h3>Questão ${idx + 1}</h3>
      <div class="question-text">${escapeHtml(q.enunciado || '').replace(/\n/g, '<br>')}</div>
      <div class="options">
        ${alternatives.map(([letter, text]) => `
          <label class="option" data-letter="${letter}">
            <input type="radio" name="answer-${escapeHtml(q.id)}" value="${letter}">
            <span class="option-letter">${letter}</span>
            <span>${escapeHtml(text)}</span>
          </label>
        `).join('')}
      </div>
      <div class="review-box">
        <label class="review-line">
          <input type="checkbox" class="review-check"> Marcar para revisão
        </label>
        <input class="review-reason hidden" type="text" placeholder="Motivo: dúvida, chute, duas alternativas..." maxlength="180">
      </div>
      <div class="answer-note hidden"></div>
    </article>
  `;
}

function hydrateResponses() {
  state.questions.forEach(q => {
    const card = cardFor(q.id);
    const answer = state.answers[q.id];
    if (answer) {
      const radio = card.querySelector(`input[type="radio"][value="${CSS.escape(answer)}"]`);
      if (radio) radio.checked = true;
    }
    const review = !!state.reviews[q.id];
    const check = card.querySelector('.review-check');
    const reason = card.querySelector('.review-reason');
    check.checked = review;
    reason.classList.toggle('hidden', !review);
    reason.value = state.reviewReasons[q.id] || '';
  });
}

function cardFor(qid) {
  return document.querySelector(`.question-card[data-qid="${CSS.escape(qid)}"]`);
}

function onQuestionChange(event) {
  const card = event.target.closest('.question-card');
  if (!card) return;
  const qid = card.dataset.qid;

  if (event.target.matches('input[type="radio"]')) {
    state.answers[qid] = event.target.value;
  }
  if (event.target.matches('.review-check')) {
    state.reviews[qid] = event.target.checked;
    const reason = card.querySelector('.review-reason');
    reason.classList.toggle('hidden', !event.target.checked);
    if (!event.target.checked) {
      state.reviewReasons[qid] = '';
      reason.value = '';
    }
  }
  updateProgress();
  saveState();
}

function onReasonInput(event) {
  if (!event.target.matches('.review-reason')) return;
  const card = event.target.closest('.question-card');
  state.reviewReasons[card.dataset.qid] = event.target.value;
  saveState();
}

function updateProgress() {
  const answered = state.questions.filter(q => state.answers[q.id]).length;
  const total = state.questions.length || 1;
  $('#progress-text').textContent = `${answered} respondida${answered === 1 ? '' : 's'} de ${total}`;
  $('#progress-bar').style.width = `${(answered / total) * 100}%`;
}

function finalizeQuiz() {
  if (!state.questions.length) return;
  const unanswered = state.questions.filter(q => !state.answers[q.id]).length;
  if (unanswered && !confirm(`Ainda há ${unanswered} questão(ões) sem resposta. Finalizar mesmo assim?`)) return;

  state.finalized = true;
  state.finishedAt = Date.now();
  stopTimer();

  let correct = 0;
  state.questions.forEach(q => {
    const card = cardFor(q.id);
    const chosen = state.answers[q.id] || null;
    const key = q.gabarito_historico;
    if (chosen === key) correct++;

    card.querySelectorAll('.option').forEach(opt => {
      const letter = opt.dataset.letter;
      opt.classList.toggle('correct', letter === key);
      opt.classList.toggle('incorrect', !!chosen && letter === chosen && chosen !== key);
    });

    card.querySelectorAll('input').forEach(input => input.disabled = true);
    const note = card.querySelector('.answer-note');
    note.classList.remove('hidden', 'ok', 'bad');
    note.classList.add(chosen === key ? 'ok' : 'bad');
    note.textContent = chosen === key
      ? `Correta: ${key}.`
      : `Sua resposta: ${chosen || 'em branco'} · Gabarito: ${key}.`;
  });

  const percent = Math.round((correct / state.questions.length) * 100);
  $('#score-title').textContent = `${correct} / ${state.questions.length}`;
  $('#score-detail').textContent = `${percent}% de acertos · tempo ${formatTime(state.finishedAt - state.startedAt)}`;
  $('#report').value = buildReport(correct);
  $('#results').classList.remove('hidden');
  $('#finish-btn').disabled = true;
  localStorage.removeItem(STORAGE_KEY);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

function buildReport(correct) {
  const lines = [];
  lines.push('SIMULADO IFSULDEMINAS — MVP');
  lines.push(`Questões: ${state.questions.length}`);
  lines.push(`Acertos: ${correct}/${state.questions.length}`);
  lines.push(`Tempo: ${formatTime(state.finishedAt - state.startedAt)}`);
  lines.push('');
  lines.push('RESPOSTAS:');
  state.questions.forEach((q, i) => {
    const chosen = state.answers[q.id] || '-';
    const review = state.reviews[q.id] ? ' | PARA REVISAR' : '';
    const reason = state.reviewReasons[q.id] ? ` | ${state.reviewReasons[q.id]}` : '';
    lines.push(`Q${String(i + 1).padStart(2, '0')} [${q.id}]: ${chosen} | GAB ${q.gabarito_historico}${review}${reason}`);
  });
  return lines.join('\n');
}

async function copyReport() {
  const text = $('#report').value;
  await navigator.clipboard.writeText(text);
  const btn = $('#copy-report-btn');
  const old = btn.textContent;
  btn.textContent = 'Copiado ✓';
  setTimeout(() => btn.textContent = old, 1200);
}

function saveState() {
  if (!state.questions.length || state.finalized) return;
  const saved = {
    questionIds: state.questions.map(q => q.id),
    answers: state.answers,
    reviews: state.reviews,
    reviewReasons: state.reviewReasons,
    startedAt: state.startedAt,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function resumeQuiz() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    const byId = new Map(state.bank.map(q => [q.id, q]));
    state.questions = (saved.questionIds || []).map(id => byId.get(id)).filter(Boolean);
    if (!state.questions.length) throw new Error('Questões salvas não encontradas');
    state.answers = saved.answers || {};
    state.reviews = saved.reviews || {};
    state.reviewReasons = saved.reviewReasons || {};
    state.startedAt = saved.startedAt || Date.now();
    state.finishedAt = null;
    state.finalized = false;
    showQuiz();
  } catch (err) {
    localStorage.removeItem(STORAGE_KEY);
    $('#config-message').textContent = 'O simulado salvo não pôde ser retomado e foi descartado.';
    $('#resume-btn').classList.add('hidden');
  }
}

function resetToConfig() {
  stopTimer();
  $('#quiz').classList.add('hidden');
  $('#results').classList.add('hidden');
  $('#config').classList.remove('hidden');
  $('#finish-btn').disabled = false;
  $('#timer').textContent = '00:00';
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

async function init() {
  try {
    const response = await fetch(DATA_URL, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.bank = normalizePayload(payload).filter(q => q && q.id && q.alternativas);
    renderConfig();
  } catch (err) {
    $('#config-message').textContent = 'Não foi possível carregar o banco de questões. Abra o site pelo GitHub Pages, não diretamente como arquivo local.';
    $('#start-btn').disabled = true;
    console.error(err);
  }
}

$('#start-btn').addEventListener('click', createQuiz);
$('#resume-btn').addEventListener('click', resumeQuiz);
$('#finish-btn').addEventListener('click', finalizeQuiz);
$('#copy-report-btn').addEventListener('click', copyReport);
$('#new-btn').addEventListener('click', resetToConfig);
$('#back-config-btn').addEventListener('click', () => {
  saveState();
  resetToConfig();
  $('#resume-btn').classList.remove('hidden');
});

init();
