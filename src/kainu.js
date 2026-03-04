/**
 * Kainu et al. (2015) Finnish spirometry reference equations.
 * Ported from rkainu R package.
 *
 * Equations:
 *   M = exp(a0 + a1*ln(height_cm) + a2*ln(age) + Mspline)
 *   S = exp(b0 + b1*ln(age) + Sspline)
 *   LLN = M - 1.645 * S
 *   z = (observed - M) / S
 */

import { COEFFICIENTS, SPLINES } from './kainu-data.js';

/** All valid parameter names. */
export const PARAMS = [
  'VC', 'FVC', 'FEV1', 'FEV1FVC', 'PEF',
  'FEV6', 'FEV1FEV6', 'MMEF', 'MEF75', 'MEF50', 'MEF25',
];

/** Core parameters (always shown). */
export const CORE_PARAMS = ['VC', 'FVC', 'FEV1', 'FEV1FVC', 'PEF'];

/** Advanced parameters (shown on toggle). */
export const ADV_PARAMS = ['FEV6', 'FEV1FEV6', 'MMEF', 'MEF75', 'MEF50', 'MEF25'];

/** VC uses FVC reference equations. */
const PARAM_ALIAS = { VC: 'FVC' };
function resolveParam(param) {
  return PARAM_ALIAS[param] || param;
}

/** Get coefficients for a param + sex combination. */
function getCoeffs(param, sex) {
  return COEFFICIENTS.find((c) => c.param === param && c.sex === sex);
}

/** Linear interpolation in spline table with clamping. */
function getSpline(param, sex, age) {
  const key = `${param}_${sex}`;
  const sp = SPLINES[key];
  if (!sp) return { mspline: 0, sspline: 0 };

  const { ages, mspline, sspline } = sp;
  const ageMin = ages[0];
  const ageMax = ages[ages.length - 1];
  const ageClamped = Math.max(ageMin, Math.min(ageMax, age));

  // Find bracket
  let lo = 0;
  let hi = ages.length - 1;
  for (let i = 0; i < ages.length - 1; i++) {
    if (ages[i] <= ageClamped && ages[i + 1] >= ageClamped) {
      lo = i;
      hi = i + 1;
      break;
    }
  }

  if (lo === hi || ages[hi] === ages[lo]) {
    return { mspline: mspline[lo], sspline: sspline[lo] };
  }

  const frac = (ageClamped - ages[lo]) / (ages[hi] - ages[lo]);
  return {
    mspline: mspline[lo] + frac * (mspline[hi] - mspline[lo]),
    sspline: sspline[lo] + frac * (sspline[hi] - sspline[lo]),
  };
}

/**
 * Compute predicted value, SD, and LLN for one parameter.
 * @param {number} age - Age in years.
 * @param {number} heightCm - Height in cm.
 * @param {number} sex - 1 = male, 2 = female.
 * @param {string} param - Parameter name (e.g., 'FEV1').
 * @returns {{ predicted: number, sd: number, lln: number }}
 */
export function kainuCompute(age, heightCm, sex, param) {
  const resolved = resolveParam(param);
  const co = getCoeffs(resolved, sex);
  if (!co) return { predicted: NaN, sd: NaN, lln: NaN };

  const sp = getSpline(resolved, sex, age);

  const predicted = Math.exp(co.a0 + co.a1 * Math.log(heightCm) + co.a2 * Math.log(age) + sp.mspline);
  const sd = Math.exp(co.b0 + co.b1 * Math.log(age) + sp.sspline);
  const lln = predicted - 1.645 * sd;

  return { predicted, sd, lln };
}

/**
 * Compute z-score.
 * @returns {number}
 */
export function kainuZscore(age, heightCm, sex, param, observed) {
  const { predicted, sd } = kainuCompute(age, heightCm, sex, param);
  return (observed - predicted) / sd;
}

/**
 * Compute percent predicted.
 * @returns {number}
 */
export function kainuPctPred(age, heightCm, sex, param, observed) {
  const { predicted } = kainuCompute(age, heightCm, sex, param);
  return (observed / predicted) * 100;
}
