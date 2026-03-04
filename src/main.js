import './style.css';
import { kainuCompute, kainuZscore, kainuPctPred, CORE_PARAMS, ADV_PARAMS, PARAMS } from './kainu.js';
import { t, toggleLanguage } from './i18n.js';

// --- DOM refs ---
const els = {
  age: document.getElementById('age'),
  height: document.getElementById('height'),
  resultsBody: document.getElementById('results-body'),
  resultsTheadRow: document.getElementById('results-thead-row'),
  resultsTable: document.getElementById('results-table'),
  langToggle: document.getElementById('lang-toggle'),
  helpToggle: document.getElementById('help-toggle'),
  helpPanel: document.getElementById('help-panel'),
  helpContent: document.getElementById('help-content'),
  btnAdvanced: document.getElementById('btn-advanced'),
  advancedInputs: document.getElementById('advanced-inputs'),
  interpretationContent: document.getElementById('interpretation-content'),
};

function getSex() {
  const checked = document.querySelector('input[name="sex"]:checked');
  return checked ? parseInt(checked.value, 10) : 1;
}

const PARAM_UNITS = {
  VC: 'unitL', FEV1: 'unitL', FVC: 'unitL', FEV1FVC: 'unitRatio',
  FEV6: 'unitL', FEV1FEV6: 'unitRatio',
  PEF: 'unitLs', MMEF: 'unitLs', MEF75: 'unitLs', MEF50: 'unitLs', MEF25: 'unitLs',
};

const PARAM_DECIMALS = {
  VC: 2, FEV1: 2, FVC: 2, FEV1FVC: 3, FEV6: 2, FEV1FEV6: 3,
  PEF: 1, MMEF: 2, MEF75: 2, MEF50: 2, MEF25: 2,
};

// --- Auto-calculate FEV1/FVC ---
function autoCalcRatio(phase) {
  const fev1El = document.getElementById(`${phase}-FEV1`);
  const fvcEl = document.getElementById(`${phase}-FVC`);
  const ratioEl = document.getElementById(`${phase}-FEV1FVC`);
  if (!fev1El || !fvcEl || !ratioEl) return;

  const fev1 = parseFloat(fev1El.value);
  const fvc = parseFloat(fvcEl.value);

  if (isFinite(fev1) && fev1 > 0 && isFinite(fvc) && fvc > 0) {
    ratioEl.value = (fev1 / fvc).toFixed(3);
    ratioEl.classList.add('auto-calc');
    ratioEl.readOnly = true;
  } else if (ratioEl.readOnly) {
    ratioEl.value = '';
    ratioEl.classList.remove('auto-calc');
    ratioEl.readOnly = false;
  }
}

// --- Helpers ---
function getMeasured(phase, param) {
  const el = document.getElementById(`${phase}-${param}`);
  return el ? parseFloat(el.value) : NaN;
}

function hasAnyPostBD() {
  return PARAMS.some((p) => {
    const v = getMeasured('post', p);
    return isFinite(v) && v > 0;
  });
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- Dynamic table headers ---
function updateTableHeaders(postBD) {
  if (postBD) {
    els.resultsTable.classList.add('has-post-bd');
    els.resultsTheadRow.innerHTML = `
      <th scope="col">${t('thParam')}</th>
      <th scope="col">${t('thUnit')}</th>
      <th scope="col">${t('thPreBD')}</th>
      <th scope="col">${t('thPostBD')}</th>
      <th scope="col">${t('thPredicted')}</th>
      <th scope="col">${t('thLLN')}</th>
      <th scope="col">${t('thZscore')}</th>
      <th scope="col">${t('thPctPred')}</th>
      <th scope="col">${t('thChange')}</th>
      <th scope="col">${t('thChangePctPred')}</th>
      <th scope="col">${t('thChangePctBase')}</th>
      <th scope="col">${t('thStatus')}</th>`;
  } else {
    els.resultsTable.classList.remove('has-post-bd');
    els.resultsTheadRow.innerHTML = `
      <th scope="col">${t('thParam')}</th>
      <th scope="col">${t('thUnit')}</th>
      <th scope="col">${t('thMeasured')}</th>
      <th scope="col">${t('thPredicted')}</th>
      <th scope="col">${t('thLLN')}</th>
      <th scope="col">${t('thZscore')}</th>
      <th scope="col">${t('thPctPred')}</th>
      <th scope="col">${t('thStatus')}</th>`;
  }
}

// --- Compute and render results ---
function updateResults() {
  const age = parseFloat(els.age.value);
  const height = parseFloat(els.height.value);
  const sex = getSex();

  if (!isFinite(age) || age <= 0 || !isFinite(height) || height <= 0) {
    els.resultsBody.innerHTML = '';
    renderInterpretation(null);
    return;
  }

  autoCalcRatio('pre');
  autoCalcRatio('post');

  const showAdvanced = !els.advancedInputs.classList.contains('hidden');
  const paramsToShow = showAdvanced ? PARAMS : CORE_PARAMS;
  const postBD = hasAnyPostBD();

  updateTableHeaders(postBD);

  const interpData = {};
  const dash = '<span class="muted">—</span>';
  let html = '';

  for (const p of paramsToShow) {
    const { predicted, sd, lln } = kainuCompute(age, height, sex, p);
    const dec = PARAM_DECIMALS[p] || 2;
    const isAdv = ADV_PARAMS.includes(p);

    const pre = getMeasured('pre', p);
    const hasPre = isFinite(pre) && pre > 0;

    let preZ = NaN, prePct = NaN;
    if (hasPre) {
      preZ = kainuZscore(age, height, sex, p, pre);
      prePct = kainuPctPred(age, height, sex, p, pre);
    }

    // Store for interpretation
    interpData[p] = { predicted, sd, lln, pre, preZ, prePct, hasPre };

    // Status badge (based on pre-BD)
    let statusHtml;
    if (hasPre) {
      if (pre < lln) {
        statusHtml = `<span class="status status-below">${t('statusBelowLLN')}</span>`;
      } else if (Math.abs(preZ) > 1.0) {
        statusHtml = `<span class="status status-borderline">${t('statusBorderline')}</span>`;
      } else {
        statusHtml = `<span class="status status-normal">${t('statusNormal')}</span>`;
      }
    } else {
      statusHtml = `<span class="status-na">${t('statusNA')}</span>`;
    }

    html += `<tr class="${isAdv ? 'row-advanced' : ''}">
      <td class="param-name">${t('param' + p)}</td>
      <td class="muted">${t(PARAM_UNITS[p])}</td>
      <td class="num">${hasPre ? pre.toFixed(dec) : dash}</td>`;

    if (postBD) {
      const post = getMeasured('post', p);
      const hasPost = isFinite(post) && post > 0;

      let postStr = dash, absStr = dash, pctPredStr = dash, pctBaseStr = dash;

      if (hasPost) {
        postStr = post.toFixed(dec);

        if (hasPre) {
          const absChange = post - pre;
          const pctPredChange = (absChange / predicted) * 100;
          const pctBaseChange = (absChange / pre) * 100;

          const sign = (v) => (v >= 0 ? '+' : '');
          absStr = sign(absChange) + absChange.toFixed(dec);
          pctPredStr = sign(pctPredChange) + pctPredChange.toFixed(1);
          pctBaseStr = sign(pctBaseChange) + pctBaseChange.toFixed(1);

          // Store BD data for FEV1 and FVC
          if (p === 'FEV1' || p === 'FVC') {
            interpData[p].post = post;
            interpData[p].absChange = absChange;
            interpData[p].pctPredChange = pctPredChange;
            interpData[p].pctBaseChange = pctBaseChange;
          }
        }
      }

      html += `
        <td class="num">${postStr}</td>
        <td class="num">${predicted.toFixed(dec)}</td>
        <td class="num">${lln.toFixed(dec)}</td>
        <td class="num">${hasPre ? preZ.toFixed(2) : dash}</td>
        <td class="num">${hasPre ? prePct.toFixed(1) : dash}</td>
        <td class="num">${absStr}</td>
        <td class="num">${pctPredStr}</td>
        <td class="num">${pctBaseStr}</td>
        <td>${statusHtml}</td>
      </tr>`;
    } else {
      html += `
        <td class="num">${predicted.toFixed(dec)}</td>
        <td class="num">${lln.toFixed(dec)}</td>
        <td class="num">${hasPre ? preZ.toFixed(2) : dash}</td>
        <td class="num">${hasPre ? prePct.toFixed(1) : dash}</td>
        <td>${statusHtml}</td>
      </tr>`;
    }
  }

  els.resultsBody.innerHTML = html;
  renderInterpretation(interpData);
}

// --- Stanojevic 2022 Interpretation ---
function renderInterpretation(data) {
  const el = els.interpretationContent;
  if (!el) return;
  if (!data) { el.innerHTML = ''; return; }

  const hasFEV1 = data.FEV1?.hasPre;
  const hasFVC = data.FVC?.hasPre;
  const hasRatio = data.FEV1FVC?.hasPre;

  if (!hasFEV1 && !hasFVC && !hasRatio) {
    el.innerHTML = `<p class="interp-note">${t('interpretHint')}</p>`;
    return;
  }

  const items = [];

  // Pattern classification
  const isObstructed = hasRatio && data.FEV1FVC.pre < data.FEV1FVC.lln;
  const fvcBelowLLN = hasFVC && data.FVC.pre < data.FVC.lln;

  // Severity by FEV1 z-score
  let severityKey = null;
  if (hasFEV1) {
    const z = data.FEV1.preZ;
    if (z <= -4.0) severityKey = 'severe';
    else if (z <= -2.5) severityKey = 'moderate';
    else if (z <= -1.645) severityKey = 'mild';
  }

  const severityBadge = severityKey
    ? ` <span class="severity-badge severity-${severityKey}">${t('severity' + capitalize(severityKey))}</span>`
    : '';

  if (isObstructed && fvcBelowLLN) {
    items.push({ cls: 'interp-mixed', html: t('patternMixed') + severityBadge });
    items.push({ cls: 'interp-note', html: t('noteMixedPattern') });
  } else if (isObstructed) {
    items.push({ cls: 'interp-obstruction', html: t('patternObstructive') + severityBadge });
  } else if (fvcBelowLLN) {
    items.push({ cls: 'interp-restriction', html: t('patternPossibleRestriction') });
    items.push({ cls: 'interp-note', html: t('noteNeedsTLC') });
  } else if (hasRatio && hasFVC) {
    items.push({ cls: 'interp-normal', html: t('patternNormal') });
  }

  // BD response
  const fev1HasBD = data.FEV1?.absChange !== undefined;
  const fvcHasBD = data.FVC?.absChange !== undefined;

  if (fev1HasBD || fvcHasBD) {
    // 2022 criterion: change >= 10% of predicted
    const bd2022 =
      (fev1HasBD && data.FEV1.pctPredChange >= 10) ||
      (fvcHasBD && data.FVC.pctPredChange >= 10);

    // 2005 criterion: change >= 200 mL AND >= 12% from baseline
    const bd2005 =
      (fev1HasBD && data.FEV1.absChange >= 0.200 && data.FEV1.pctBaseChange >= 12) ||
      (fvcHasBD && data.FVC.absChange >= 0.200 && data.FVC.pctBaseChange >= 12);

    if (bd2022) {
      items.push({ cls: 'interp-bd', html: `${t('bdSignificant2022')}<small>${t('bdCriteria2022')}</small>` });
    }
    if (bd2005) {
      items.push({ cls: 'interp-bd', html: `${t('bdSignificant2005')}<small>${t('bdCriteria2005')}</small>` });
    }
    if (!bd2022 && !bd2005) {
      items.push({ cls: 'interp-bd', html: t('bdNotSignificant') });
    }
  } else if (hasFEV1 || hasFVC) {
    items.push({ cls: 'interp-note', html: t('bdNotAssessed') });
  }

  let html = items
    .map((item) => `<div class="interpretation-item ${item.cls}">${item.html}</div>`)
    .join('');
  html += `<p class="interp-ref">${t('interpretRef')}</p>`;
  el.innerHTML = html;
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
  document.getElementById('label-pre-bd').textContent = t('labelPreBD');
  document.getElementById('label-post-bd').textContent = t('labelPostBD');

  const showAdvanced = !els.advancedInputs.classList.contains('hidden');
  els.btnAdvanced.textContent = showAdvanced ? t('btnHideAdvanced') : t('btnAdvanced');

  document.getElementById('section-results').textContent = t('sectionResults');
  document.getElementById('section-interpretation').textContent = t('sectionInterpretation');

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

  // Measured value inputs (pre and post) → live update
  PARAMS.forEach((p) => {
    ['pre', 'post'].forEach((phase) => {
      const el = document.getElementById(`${phase}-${p}`);
      if (el) {
        ['input', 'change'].forEach((ev) =>
          el.addEventListener(ev, () => {
            if (p === 'FEV1' || p === 'FVC') autoCalcRatio(phase);
            updateResults();
          }),
        );
      }
    });
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
