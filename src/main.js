import './style.css';
import { kainuCompute, kainuZscore, kainuPctPred, CORE_PARAMS, ADV_PARAMS, PARAMS } from './kainu.js';
import { dlcoCompute, dlcoZscore, dlcoPctPred, DLCO_PARAMS } from './dlco.js';
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
  // Tabs
  tabSpiro: document.getElementById('tab-spiro'),
  tabDlco: document.getElementById('tab-dlco'),
  panelSpiro: document.getElementById('panel-spiro'),
  panelDlco: document.getElementById('panel-dlco'),
  // DLCO
  dlcoAge: document.getElementById('dlco-age'),
  dlcoHeight: document.getElementById('dlco-height'),
  dlcoWeight: document.getElementById('dlco-weight'),
  dlcoResultsBody: document.getElementById('dlco-results-body'),
  dlcoResultsTheadRow: document.getElementById('dlco-results-thead-row'),
  dlcoInterpretationContent: document.getElementById('dlco-interpretation-content'),
};

let activeTab = 'spiro';

// ======================== TAB SWITCHING ========================

function switchTab(tab) {
  activeTab = tab;
  els.tabSpiro.classList.toggle('active', tab === 'spiro');
  els.tabDlco.classList.toggle('active', tab === 'dlco');
  els.tabSpiro.setAttribute('aria-selected', tab === 'spiro');
  els.tabDlco.setAttribute('aria-selected', tab === 'dlco');
  els.panelSpiro.classList.toggle('active', tab === 'spiro');
  els.panelDlco.classList.toggle('active', tab === 'dlco');

  // Update header subtitle, footer, help, and title for active tab
  const sub = tab === 'dlco' ? t('dlcoSubtitle') : t('subtitle');
  document.getElementById('app-subtitle').textContent = sub;
  document.title = tab === 'dlco'
    ? t('dlcoTitle') + ' — Kainu et al. (2017)'
    : t('title') + ' — Kainu et al. (2015)';
  updateFooter();
  renderHelp();
}

function updateFooter() {
  const ref = activeTab === 'dlco' ? t('dlcoFooterRef') : t('footerRef');
  document.getElementById('footer-ref').textContent = ref;
}

// ======================== SPIROMETRY (unchanged) ========================

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

    interpData[p] = { predicted, sd, lln, pre, preZ, prePct, hasPre };

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

  const isObstructed = hasRatio && data.FEV1FVC.pre < data.FEV1FVC.lln;
  const fvcBelowLLN = hasFVC && data.FVC.pre < data.FVC.lln;

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

  const fev1HasBD = data.FEV1?.absChange !== undefined;
  const fvcHasBD = data.FVC?.absChange !== undefined;

  if (fev1HasBD || fvcHasBD) {
    const bd2022 =
      (fev1HasBD && data.FEV1.pctPredChange >= 10) ||
      (fvcHasBD && data.FVC.pctPredChange >= 10);

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

// ======================== DLCO ========================

function getDlcoSex() {
  const checked = document.querySelector('input[name="dlco-sex"]:checked');
  return checked ? parseInt(checked.value, 10) : 1;
}

const DLCO_PARAM_LABELS = { DLCO: 'dlcoParamDLCO', DLCOVA: 'dlcoParamDLCOVA', VA: 'dlcoParamVA' };
const DLCO_PARAM_UNITS = { DLCO: 'dlcoUnitDLCO', DLCOVA: 'dlcoUnitDLCOVA', VA: 'dlcoUnitVA' };
const DLCO_PARAM_DECIMALS = { DLCO: 2, DLCOVA: 2, VA: 2 };

function updateDlcoResults() {
  const age = parseFloat(els.dlcoAge.value);
  const heightCm = parseFloat(els.dlcoHeight.value);
  const weightKg = parseFloat(els.dlcoWeight.value);
  const sex = getDlcoSex();

  if (!isFinite(age) || age <= 0 || !isFinite(heightCm) || heightCm <= 0 || !isFinite(weightKg) || weightKg <= 0) {
    els.dlcoResultsBody.innerHTML = '';
    renderDlcoInterpretation(null);
    return;
  }

  // Age range warning
  const dlcoWarn = document.getElementById('dlco-age-warning');
  if (dlcoWarn) {
    dlcoWarn.textContent = (age < 18 || age > 83) ? t('dlcoAgeWarning') : '';
  }

  // Table headers
  els.dlcoResultsTheadRow.innerHTML = `
    <th scope="col">${t('thParam')}</th>
    <th scope="col">${t('thUnit')}</th>
    <th scope="col">${t('thMeasured')}</th>
    <th scope="col">${t('thPredicted')}</th>
    <th scope="col">${t('thLLN')}</th>
    <th scope="col">${t('thZscore')}</th>
    <th scope="col">${t('thPctPred')}</th>
    <th scope="col">${t('thStatus')}</th>`;

  const dash = '<span class="muted">—</span>';
  let html = '';
  const interpData = {};

  for (const p of DLCO_PARAMS) {
    const { predicted, sd, lln } = dlcoCompute(age, heightCm, weightKg, sex, p);
    const dec = DLCO_PARAM_DECIMALS[p];

    const measEl = document.getElementById(`dlco-meas-${p}`);
    const meas = measEl ? parseFloat(measEl.value) : NaN;
    const hasMeas = isFinite(meas) && meas > 0;

    let zScore = NaN, pctPred = NaN;
    if (hasMeas) {
      zScore = dlcoZscore(age, heightCm, weightKg, sex, p, meas);
      pctPred = dlcoPctPred(age, heightCm, weightKg, sex, p, meas);
    }

    interpData[p] = { predicted, sd, lln, meas, zScore, pctPred, hasMeas };

    let statusHtml;
    if (hasMeas) {
      if (meas < lln) {
        statusHtml = `<span class="status status-below">${t('statusBelowLLN')}</span>`;
      } else if (Math.abs(zScore) > 1.0) {
        statusHtml = `<span class="status status-borderline">${t('statusBorderline')}</span>`;
      } else {
        statusHtml = `<span class="status status-normal">${t('statusNormal')}</span>`;
      }
    } else {
      statusHtml = `<span class="status-na">${t('statusNA')}</span>`;
    }

    html += `<tr>
      <td class="param-name">${t(DLCO_PARAM_LABELS[p])}</td>
      <td class="muted">${t(DLCO_PARAM_UNITS[p])}</td>
      <td class="num">${hasMeas ? meas.toFixed(dec) : dash}</td>
      <td class="num">${predicted.toFixed(dec)}</td>
      <td class="num">${lln.toFixed(dec)}</td>
      <td class="num">${hasMeas ? zScore.toFixed(2) : dash}</td>
      <td class="num">${hasMeas ? pctPred.toFixed(1) : dash}</td>
      <td>${statusHtml}</td>
    </tr>`;
  }

  els.dlcoResultsBody.innerHTML = html;
  renderDlcoInterpretation(interpData);
}

/**
 * DLCO interpretation based on Timonen et al. 2021 (Lääkärilehti):
 *   Normal: z >= -1.65
 *   Mildly reduced: -3.0 <= z < -1.65
 *   Clearly reduced: z < -3.0
 */
function renderDlcoInterpretation(data) {
  const el = els.dlcoInterpretationContent;
  if (!el) return;
  if (!data) { el.innerHTML = ''; return; }

  const dlco = data.DLCO;
  if (!dlco?.hasMeas) {
    el.innerHTML = `<p class="interp-note">${t('dlcoInterpretHint')}</p>`;
    return;
  }

  const items = [];
  const z = dlco.zScore;

  if (z >= -1.65) {
    items.push({ cls: 'interp-dlco-normal', html: t('dlcoInterpNormal') });
  } else if (z >= -3.0) {
    items.push({
      cls: 'interp-dlco-mild',
      html: `${t('dlcoInterpMild')} <span class="severity-badge severity-mild">z = ${z.toFixed(2)}</span>`,
    });
  } else {
    items.push({
      cls: 'interp-dlco-severe',
      html: `${t('dlcoInterpSevere')} <span class="severity-badge severity-severe">z = ${z.toFixed(2)}</span>`,
    });
  }

  // Also interpret DLCO/VA if available
  const dlcova = data.DLCOVA;
  if (dlcova?.hasMeas) {
    const zva = dlcova.zScore;
    if (zva < -1.65) {
      const sevCls = zva < -3.0 ? 'severity-severe' : 'severity-mild';
      const label = zva < -3.0 ? t('dlcoInterpSevere') : t('dlcoInterpMild');
      items.push({
        cls: zva < -3.0 ? 'interp-dlco-severe' : 'interp-dlco-mild',
        html: `${t('dlcoParamDLCOVA')}: ${label.toLowerCase()} <span class="severity-badge ${sevCls}">z = ${zva.toFixed(2)}</span>`,
      });
    }
  }

  let html = items
    .map((item) => `<div class="interpretation-item ${item.cls}">${item.html}</div>`)
    .join('');
  html += `<p class="interp-ref">${t('dlcoInterpRef')}</p>`;
  el.innerHTML = html;
}

// ======================== i18n ========================

function updateAllText() {
  document.getElementById('app-title').textContent = t('title');
  document.getElementById('app-subtitle').textContent = t('subtitle');
  els.langToggle.textContent = t('languageToggle');

  // Tab labels
  els.tabSpiro.textContent = t('tabSpiro');
  els.tabDlco.textContent = t('tabDlco');

  // Spirometry panel
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

  // DLCO panel
  document.getElementById('dlco-section-patient').textContent = t('sectionPatient');
  document.getElementById('dlco-label-age').textContent = t('labelAge');
  document.getElementById('dlco-label-height').textContent = t('labelHeight');
  document.getElementById('dlco-label-weight').textContent = t('dlcoLabelWeight');
  document.getElementById('dlco-label-sex').textContent = t('labelSex');
  document.getElementById('dlco-label-male').textContent = t('sexMale');
  document.getElementById('dlco-label-female').textContent = t('sexFemale');
  document.getElementById('dlco-section-measured').textContent = t('sectionMeasured');
  document.getElementById('dlco-measured-hint').textContent = t('dlcoMeasuredHint');
  document.getElementById('dlco-section-results').textContent = t('sectionResults');
  document.getElementById('dlco-section-interpretation').textContent = t('sectionInterpretation');

  // Footer
  updateFooter();
  document.getElementById('footer-note').textContent = t('footerNote');
  document.getElementById('footer-rpkg').textContent = t('footerRpkg');

  renderHelp();
  updateResults();
  updateDlcoResults();
}

function renderHelp() {
  const stepsKey = activeTab === 'dlco' ? 'dlcoHelpSteps' : 'helpSteps';
  const bgKey = activeTab === 'dlco' ? 'dlcoHelpBackground' : 'helpBackground';
  const steps = t(stepsKey);
  const bg = t(bgKey);
  let html = `<h3>${t('helpTitle')}</h3><ol>`;
  steps.forEach((s) => (html += `<li>${s}</li>`));
  html += '</ol>';
  bg.forEach((p) => (html += `<p>${p}</p>`));
  els.helpContent.innerHTML = html;
}

// ======================== EVENTS ========================

function init() {
  // Tab switching
  els.tabSpiro.addEventListener('click', () => switchTab('spiro'));
  els.tabDlco.addEventListener('click', () => switchTab('dlco'));

  // Spirometry: patient inputs → live update
  ['input', 'change'].forEach((ev) => {
    els.age.addEventListener(ev, updateResults);
    els.height.addEventListener(ev, updateResults);
  });
  document.querySelectorAll('input[name="sex"]').forEach((r) =>
    r.addEventListener('change', updateResults),
  );

  // Spirometry: measured value inputs
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

  // Spirometry: advanced toggle
  els.btnAdvanced.addEventListener('click', () => {
    els.advancedInputs.classList.toggle('hidden');
    const showAdvanced = !els.advancedInputs.classList.contains('hidden');
    els.btnAdvanced.textContent = showAdvanced ? t('btnHideAdvanced') : t('btnAdvanced');
    els.btnAdvanced.setAttribute('aria-expanded', showAdvanced);
    updateResults();
  });

  // DLCO: patient inputs → live update
  ['input', 'change'].forEach((ev) => {
    els.dlcoAge.addEventListener(ev, updateDlcoResults);
    els.dlcoHeight.addEventListener(ev, updateDlcoResults);
    els.dlcoWeight.addEventListener(ev, updateDlcoResults);
  });
  document.querySelectorAll('input[name="dlco-sex"]').forEach((r) =>
    r.addEventListener('change', updateDlcoResults),
  );

  // DLCO: measured value inputs
  DLCO_PARAMS.forEach((p) => {
    const el = document.getElementById(`dlco-meas-${p}`);
    if (el) {
      ['input', 'change'].forEach((ev) =>
        el.addEventListener(ev, updateDlcoResults),
      );
    }
  });

  // Language toggle
  els.langToggle.addEventListener('click', () => {
    const lang = toggleLanguage();
    document.documentElement.lang = lang;
    document.title = activeTab === 'dlco'
      ? t('dlcoTitle') + ' — Kainu et al. (2017)'
      : t('title') + ' — Kainu et al. (2015)';
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
