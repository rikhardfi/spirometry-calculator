const translations = {
  en: {
    title: 'Spirometry Reference Calculator',
    subtitle: 'Finnish reference values — Kainu et al. (2015)',
    languageToggle: 'FI',

    sectionPatient: '1. Patient',
    labelAge: 'Age (years)',
    labelHeight: 'Height (cm)',
    labelSex: 'Sex',
    sexMale: 'Male',
    sexFemale: 'Female',

    sectionMeasured: '2. Measured values',
    measuredHint: 'Enter measured values to compute z-scores and % predicted. Leave empty to see reference values only.',
    labelPreBD: 'PRE',
    labelPostBD: 'POST',
    btnAdvanced: 'Show advanced parameters',
    btnHideAdvanced: 'Hide advanced parameters',

    sectionResults: '3. Reference values',
    thParam: 'Parameter',
    thUnit: 'Unit',
    thMeasured: 'Measured',
    thPreBD: 'PRE',
    thPostBD: 'POST',
    thPredicted: 'Predicted',
    thLLN: 'LLN',
    thZscore: 'Z-score',
    thPctPred: '% Pred',
    thChange: 'Change',
    thChangePctPred: 'Δ% Pred',
    thChangePctBase: 'Δ% Base',
    thStatus: 'Status',

    statusNormal: 'Normal',
    statusBorderline: 'Borderline',
    statusBelowLLN: 'Below LLN',
    statusNA: '—',

    paramVC: 'VC',
    paramFEV1: 'FEV₁',
    paramFVC: 'FVC',
    paramFEV1FVC: 'FEV₁/FVC',
    paramPEF: 'PEF',
    paramFEV6: 'FEV₆',
    paramFEV1FEV6: 'FEV₁/FEV₆',
    paramMMEF: 'MMEF',
    paramMEF75: 'MEF₇₅',
    paramMEF50: 'MEF₅₀',
    paramMEF25: 'MEF₂₅',

    unitL: 'L',
    unitLs: 'L/s',
    unitRatio: 'ratio',

    // Interpretation
    sectionInterpretation: '4. Interpretation',
    interpretHint: 'Enter at least FEV₁, FVC, or FEV₁/FVC to see interpretation.',
    patternNormal: 'Normal spirometry',
    patternObstructive: 'Obstructive pattern',
    patternPossibleRestriction: 'Possible restriction',
    patternMixed: 'Mixed pattern',
    severityMild: 'Mild',
    severityModerate: 'Moderate',
    severitySevere: 'Severe',
    noteNeedsTLC: 'Reduced FVC may indicate restriction, but TLC measurement is needed to confirm.',
    noteMixedPattern: 'Both FEV₁/FVC and FVC are below LLN. Consider mixed obstructive-restrictive pattern. TLC measurement needed.',

    // Bronchodilator response
    bdSignificant2022: 'Significant BD response (ERS/ATS 2022)',
    bdSignificant2005: 'Significant BD response (ATS/ERS 2005)',
    bdNotSignificant: 'No significant BD response',
    bdNotAssessed: 'BD response not assessed — no post-BD values entered.',
    bdCriteria2022: 'FEV₁ or FVC change ≥10% of predicted value',
    bdCriteria2005: 'FEV₁ or FVC change ≥200 mL AND ≥12% from baseline',
    interpretRef: 'Interpretation: Stanojevic et al. Eur Respir J. 2022;60(1):2101499.',

    footerRef: 'Kainu A et al. Reference values of spirometry for Finnish adults. Clin Physiol Funct Imaging. 2016;36(5):346-358.',
    footerNote: 'For clinical decision-making, always consider clinical context. This calculator is for reference only.',
    footerRpkg: 'R package:',

    helpTitle: 'How to use',
    helpSteps: [
      'Enter patient age, height, and sex.',
      'Enter pre-bronchodilator measured values. Post-BD values are optional.',
      'FEV₁/FVC is auto-calculated when both FEV₁ and FVC are entered.',
      'Results update automatically — predicted values, LLN, z-scores, and percent predicted.',
      'The interpretation section classifies the pattern (Stanojevic 2022) and assesses BD response.',
    ],
    helpBackground: [
      'Reference values are from Kainu et al. (2015), based on 1000 healthy Finnish adults aged 18–83.',
      'LLN is the 5th percentile: predicted − 1.645 × SD. Values below LLN are considered abnormal.',
      'Interpretation follows ERS/ATS 2022 technical standard. Severity is graded by FEV₁ z-score.',
      'BD response: 2022 criterion (≥10% of predicted) and 2005 criterion (≥200 mL + ≥12% from baseline) are both shown.',
    ],
  },
  fi: {
    title: 'Spirometrian viitearvot',
    subtitle: 'Suomalaiset viitearvot — Kainu ym. (2015)',
    languageToggle: 'EN',

    sectionPatient: '1. Potilas',
    labelAge: 'Ikä (vuosia)',
    labelHeight: 'Pituus (cm)',
    labelSex: 'Sukupuoli',
    sexMale: 'Mies',
    sexFemale: 'Nainen',

    sectionMeasured: '2. Mitatut arvot',
    measuredHint: 'Syötä mitatut arvot z-pisteiden ja %-ennustettujen laskemiseksi. Jätä tyhjäksi nähdäksesi viitearvot.',
    labelPreBD: 'PRE',
    labelPostBD: 'POST',
    btnAdvanced: 'Näytä lisäparametrit',
    btnHideAdvanced: 'Piilota lisäparametrit',

    sectionResults: '3. Viitearvot',
    thParam: 'Parametri',
    thUnit: 'Yksikkö',
    thMeasured: 'Mitattu',
    thPreBD: 'PRE',
    thPostBD: 'POST',
    thPredicted: 'Ennustettu',
    thLLN: 'LLN',
    thZscore: 'Z-pistemäärä',
    thPctPred: '% Enn.',
    thChange: 'Muutos',
    thChangePctPred: 'Δ% Enn.',
    thChangePctBase: 'Δ% Lähtö',
    thStatus: 'Tila',

    statusNormal: 'Normaali',
    statusBorderline: 'Rajatapaus',
    statusBelowLLN: 'Alle LLN',
    statusNA: '—',

    paramVC: 'VC',
    paramFEV1: 'FEV₁',
    paramFVC: 'FVC',
    paramFEV1FVC: 'FEV₁/FVC',
    paramPEF: 'PEF',
    paramFEV6: 'FEV₆',
    paramFEV1FEV6: 'FEV₁/FEV₆',
    paramMMEF: 'MMEF',
    paramMEF75: 'MEF₇₅',
    paramMEF50: 'MEF₅₀',
    paramMEF25: 'MEF₂₅',

    unitL: 'L',
    unitLs: 'L/s',
    unitRatio: 'suhde',

    // Interpretation
    sectionInterpretation: '4. Tulkinta',
    interpretHint: 'Syötä vähintään FEV₁, FVC tai FEV₁/FVC nähdäksesi tulkinnan.',
    patternNormal: 'Normaali spirometria',
    patternObstructive: 'Obstruktiivinen löydös',
    patternPossibleRestriction: 'Mahdollinen restriktio',
    patternMixed: 'Sekamuotoinen löydös',
    severityMild: 'Lievä',
    severityModerate: 'Keskivaikea',
    severitySevere: 'Vaikea',
    noteNeedsTLC: 'Alentunut FVC voi viitata restriktioon, mutta TLC-mittaus tarvitaan varmistamiseksi.',
    noteMixedPattern: 'Sekä FEV₁/FVC että FVC ovat alle LLN. Harkitse sekamuotoista obstruktiivista-restriktiivistä löydöstä. TLC-mittaus tarvitaan.',

    // Bronchodilator response
    bdSignificant2022: 'Merkittävä BD-vaste (ERS/ATS 2022)',
    bdSignificant2005: 'Merkittävä BD-vaste (ATS/ERS 2005)',
    bdNotSignificant: 'Ei merkittävää BD-vastetta',
    bdNotAssessed: 'BD-vastetta ei arvioitu — ei BD:n jälkeisiä arvoja.',
    bdCriteria2022: 'FEV₁:n tai FVC:n muutos ≥10 % ennustetusta arvosta',
    bdCriteria2005: 'FEV₁:n tai FVC:n muutos ≥200 ml JA ≥12 % lähtöarvosta',
    interpretRef: 'Tulkinta: Stanojevic ym. Eur Respir J. 2022;60(1):2101499.',

    footerRef: 'Kainu A ym. Reference values of spirometry for Finnish adults. Clin Physiol Funct Imaging. 2016;36(5):346-358.',
    footerNote: 'Kliinisessä päätöksenteossa huomioi aina kliininen konteksti. Laskuri on tarkoitettu viitearvojen tarkistamiseen.',
    footerRpkg: 'R-paketti:',

    helpTitle: 'Käyttöohje',
    helpSteps: [
      'Syötä potilaan ikä, pituus ja sukupuoli.',
      'Syötä mitatut arvot ennen bronkodilaatiota. BD:n jälkeiset arvot ovat valinnaisia.',
      'FEV₁/FVC lasketaan automaattisesti, kun sekä FEV₁ että FVC on syötetty.',
      'Tulokset päivittyvät automaattisesti — ennustetut arvot, LLN, z-pisteet ja prosentti ennustetusta.',
      'Tulkintaosio luokittelee löydöksen (Stanojevic 2022) ja arvioi BD-vasteen.',
    ],
    helpBackground: [
      'Viitearvot perustuvat Kainun ym. (2015) tutkimukseen, jossa oli 1000 tervettä suomalaista aikuista (18–83 v).',
      'LLN on 5. persentiili: ennustettu − 1,645 × SD. LLN:n alittavat arvot ovat poikkeavia.',
      'Tulkinta noudattaa ERS/ATS 2022 -teknistä standardia. Vaikeusaste arvioidaan FEV₁:n z-pisteiden perusteella.',
      'BD-vaste: 2022-kriteeri (≥10 % ennustetusta) ja 2005-kriteeri (≥200 ml + ≥12 % lähtöarvosta) molemmat näytetään.',
    ],
  },
};

let currentLang = 'fi';

export function t(key) {
  return translations[currentLang]?.[key] ?? translations.en[key] ?? key;
}

export function getLanguage() {
  return currentLang;
}

export function toggleLanguage() {
  currentLang = currentLang === 'en' ? 'fi' : 'en';
  return currentLang;
}
