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

    sectionMeasured: '2. Measured values (optional)',
    measuredHint: 'Enter measured values to compute z-scores and % predicted. Leave empty to see reference values only.',
    btnAdvanced: 'Show advanced parameters',
    btnHideAdvanced: 'Hide advanced parameters',

    sectionResults: '3. Reference values',
    thParam: 'Parameter',
    thUnit: 'Unit',
    thMeasured: 'Measured',
    thPredicted: 'Predicted',
    thLLN: 'LLN',
    thZscore: 'Z-score',
    thPctPred: '% Pred',
    thStatus: 'Status',

    statusNormal: 'Normal',
    statusBorderline: 'Borderline',
    statusBelowLLN: 'Below LLN',
    statusNA: '—',

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

    footerRef: 'Kainu A et al. Reference values of spirometry for Finnish adults. Clin Physiol Funct Imaging. 2016;36(5):346-358.',
    footerNote: 'For clinical decision-making, always consider clinical context. This calculator is for reference only.',
    footerRpkg: 'R package:',

    helpTitle: 'How to use',
    helpSteps: [
      'Enter patient age, height, and sex.',
      'Optionally enter measured spirometry values.',
      'Results update automatically — predicted values, lower limit of normal (LLN), z-scores, and percent predicted.',
      'Values below LLN are flagged. Z-score < -1.645 corresponds to below the 5th percentile.',
    ],
    helpBackground: [
      'Reference values are from Kainu et al. (2015), based on 1000 healthy Finnish adults aged 18–83.',
      'LLN is the 5th percentile: predicted − 1.645 × SD. Values below LLN are considered abnormal.',
      'FEV₁/FVC is entered as a decimal ratio (e.g., 0.75), not as a percentage.',
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

    sectionMeasured: '2. Mitatut arvot (valinnainen)',
    measuredHint: 'Syötä mitatut arvot z-pisteiden ja %-ennustettujen laskemiseksi. Jätä tyhjäksi nähdäksesi viitearvot.',
    btnAdvanced: 'Näytä lisäparametrit',
    btnHideAdvanced: 'Piilota lisäparametrit',

    sectionResults: '3. Viitearvot',
    thParam: 'Parametri',
    thUnit: 'Yksikkö',
    thMeasured: 'Mitattu',
    thPredicted: 'Ennustettu',
    thLLN: 'LLN',
    thZscore: 'Z-pistemäärä',
    thPctPred: '% Enn.',
    thStatus: 'Tila',

    statusNormal: 'Normaali',
    statusBorderline: 'Rajatapaus',
    statusBelowLLN: 'Alle LLN',
    statusNA: '—',

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

    footerRef: 'Kainu A ym. Reference values of spirometry for Finnish adults. Clin Physiol Funct Imaging. 2016;36(5):346-358.',
    footerNote: 'Kliinisessä päätöksenteossa huomioi aina kliininen konteksti. Laskuri on tarkoitettu viitearvojen tarkistamiseen.',
    footerRpkg: 'R-paketti:',

    helpTitle: 'Käyttöohje',
    helpSteps: [
      'Syötä potilaan ikä, pituus ja sukupuoli.',
      'Syötä halutessasi mitatut spirometria-arvot.',
      'Tulokset päivittyvät automaattisesti — ennustetut arvot, viitearvojen alarajat (LLN), z-pisteet ja prosentti ennustetusta.',
      'LLN:n alittavat arvot merkitään. Z-pistemäärä < -1,645 vastaa 5. persentiilin alitusta.',
    ],
    helpBackground: [
      'Viitearvot perustuvat Kainun ym. (2015) tutkimukseen, jossa oli 1000 tervettä suomalaista aikuista (18–83 v).',
      'LLN on 5. persentiili: ennustettu − 1,645 × SD. LLN:n alittavat arvot ovat poikkeavia.',
      'FEV₁/FVC syötetään desimaalilukuna (esim. 0,75), ei prosentteina.',
    ],
  },
};

let currentLang = 'en';

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
