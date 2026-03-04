import './style.css';
import { kainuCompute, kainuZscore, kainuPctPred, CORE_PARAMS, ADV_PARAMS, PARAMS } from './kainu.js';
import { t, toggleLanguage } from './i18n.js';

// --- DOM refs ---
const els = {
  age: document.getElementById('age'),
  height: document.getElementById('height'),
  resultsBody: document.getElementById('results-body'),
  langToggle: document.getElementById('lang-toggle'),
  helpToggle: document.getElementById('help-toggle'),
  helpPanel: document.getElementById('help-panel'),
  helpContent: document.getElementById('help-content'),
  btnAdvanced: document.getElementById('btn-advanced'),
  advancedInputs: document.getElementById('advanced-inputs'),
};

function getSex() {
  const checked = document.querySelector('input[name="sex"]:checked');
  return checked ? parseInt(checked.value, 10) : 1;
}

const PARAM_UNITS = {
  FEV1: 'unitL', FVC: 'unitL', FEV1FVC: 'unitRatio',
  FEV6: 'unitL', FEV1FEV6: 'unitRatio',
  PEF: 'unitLs', MMEF: 'unitLs', MEF75: 'unitLs', MEF50: 'unitLs', MEF25: 'unitLs',
};

const PARAM_DECIMALS = {
  FEV1: 2, FVC: 2, FEV1FVC: 3, FEV6: 2, FEV1FEV6: 3,
  PEF: 1, MMEF: 2, MEF75: 2, MEF50: 2, MEF25: 2,
};

// --- Compute and render results ---
function updateResults() {
  const age = parseFloat(els.age.value);
  const height = parseFloat(els.height.value);
  const sex = getSex();

  if (!isFinite(age) || age <= 0 || !isFinite(height) || height <= 0) {
    els.resultsBody.innerHTML = '';
    return;
  }

  const showAdvanced = !els.advancedInputs.classList.contains('hidden');
  const paramsToShow = showAdvanced ? PARAMS : CORE_PARAMS;

  let html = '';
  for (const p of paramsToShow) {
    const { predicted, sd, lln } = kainuCompute(age, height, sex, p);
    const dec = PARAM_DECIMALS[p] || 2;
    const isAdv = ADV_PARAMS.includes(p);

    // Get measured value
    const mInput = document.getElementById(`m-${p}`);
    const measured = mInput ? parseFloat(mInput.value) : NaN;
    const hasMeasured = isFinite(measured) && measured > 0;

    let zStr = '', pctStr = '', statusHtml = '';
    if (hasMeasured) {
      const z = kainuZscore(age, height, sex, p, measured);
      const pct = kainuPctPred(age, height, sex, p, measured);
      zStr = z.toFixed(2);
      pctStr = pct.toFixed(1);

      if (measured < lln) {
        statusHtml = `<span class="status status-below">${t('statusBelowLLN')}</span>`;
      } else if (Math.abs(z) > 1.0) {
        statusHtml = `<span class="status status-borderline">${t('statusBorderline')}</span>`;
      } else {
        statusHtml = `<span class="status status-normal">${t('statusNormal')}</span>`;
      }
    } else {
      zStr = '<span class="muted">—</span>';
      pctStr = '<span class="muted">—</span>';
      statusHtml = `<span class="status-na">${t('statusNA')}</span>`;
    }

    html += `<tr class="${isAdv ? 'row-advanced' : ''}">
      <td class="param-name">${t('param' + p)}</td>
      <td class="muted">${t(PARAM_UNITS[p])}</td>
      <td class="num">${hasMeasured ? measured.toFixed(dec) : '<span class="muted">—</span>'}</td>
      <td class="num">${predicted.toFixed(dec)}</td>
      <td class="num">${lln.toFixed(dec)}</td>
      <td class="num">${zStr}</td>
      <td class="num">${pctStr}</td>
      <td>${statusHtml}</td>
    </tr>`;
  }

  els.resultsBody.innerHTML = html;
}

// --- i18n ---
function updateAllText() {
  document.getElementById('app-title').textContent = t('title');
  document.getElementById('app-subtitle').textContent = t('subtitle');
  els.langToggle.textContent = t('languageToggle');

  document.getElementById('section-patient').textContent = t('sectionPatient');
  document.getElementById('label-age').textContent = t('labelAge');
  document.getElementById('label-height').textContent = t('labelHeight');
  document.getElementById('label-sex').textContent = t('labelSex');
  document.getElementById('label-male').textContent = t('sexMale');
  document.getElementById('label-female').textContent = t('sexFemale');

  document.getElementById('section-measured').textContent = t('sectionMeasured');
  document.getElementById('measured-hint').textContent = t('measuredHint');

  const showAdvanced = !els.advancedInputs.classList.contains('hidden');
  els.btnAdvanced.textContent = showAdvanced ? t('btnHideAdvanced') : t('btnAdvanced');

  document.getElementById('section-results').textContent = t('sectionResults');
  document.getElementById('th-param').textContent = t('thParam');
  document.getElementById('th-unit').textContent = t('thUnit');
  document.getElementById('th-measured').textContent = t('thMeasured');
  document.getElementById('th-predicted').textContent = t('thPredicted');
  document.getElementById('th-lln').textContent = t('thLLN');
  document.getElementById('th-zscore').textContent = t('thZscore');
  document.getElementById('th-pctpred').textContent = t('thPctPred');
  document.getElementById('th-status').textContent = t('thStatus');

  document.getElementById('footer-ref').textContent = t('footerRef');
  document.getElementById('footer-note').textContent = t('footerNote');
  document.getElementById('footer-rpkg').textContent = t('footerRpkg');

  renderHelp();
  updateResults();
}

function renderHelp() {
  const steps = t('helpSteps');
  const bg = t('helpBackground');
  let html = `<h3>${t('helpTitle')}</h3><ol>`;
  steps.forEach((s) => (html += `<li>${s}</li>`));
  html += '</ol>';
  bg.forEach((p) => (html += `<p>${p}</p>`));
  els.helpContent.innerHTML = html;
}

// --- Events ---
function init() {
  // Patient inputs → live update
  ['input', 'change'].forEach((ev) => {
    els.age.addEventListener(ev, updateResults);
    els.height.addEventListener(ev, updateResults);
  });
  document.querySelectorAll('input[name="sex"]').forEach((r) =>
    r.addEventListener('change', updateResults),
  );

  // Measured value inputs → live update
  PARAMS.forEach((p) => {
    const el = document.getElementById(`m-${p}`);
    if (el) {
      ['input', 'change'].forEach((ev) => el.addEventListener(ev, updateResults));
    }
  });

  // Advanced toggle
  els.btnAdvanced.addEventListener('click', () => {
    els.advancedInputs.classList.toggle('hidden');
    const showAdvanced = !els.advancedInputs.classList.contains('hidden');
    els.btnAdvanced.textContent = showAdvanced ? t('btnHideAdvanced') : t('btnAdvanced');
    updateResults();
  });

  // Language toggle
  els.langToggle.addEventListener('click', () => {
    const lang = toggleLanguage();
    document.documentElement.lang = lang;
    document.title = t('title') + ' — Kainu et al. (2015)';
    updateAllText();
  });

  // Help toggle
  els.helpToggle.addEventListener('click', () => {
    els.helpPanel.classList.toggle('open');
  });

  // Initial render
  updateAllText();
}

document.addEventListener('DOMContentLoaded', init);
