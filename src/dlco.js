/**
 * Kainu et al. (2017) Finnish diffusing capacity reference equations.
 *
 * Equation:
 *   f = exp(a0 + a1*age + a2*ln(age) + a3*(1/height_m) + a4*weight_kg)
 *   SD = (predicted_mean - predicted_LLN) / 1.645
 *   z = (observed - predicted) / SD
 *
 * Units: DLCO in mmol/min/kPa, DLCO/VA in mmol/min/kPa/L, VA in litres.
 */

import { DLCO_COEFFICIENTS } from './dlco-data.js';

export const DLCO_PARAMS = ['DLCO', 'DLCOVA', 'VA'];

function computeValue(coeffs, age, heightM, weightKg) {
  const { a0, a1, a2, a3, a4 } = coeffs;
  return Math.exp(
    a0 +
    a1 * age +
    a2 * Math.log(age) +
    a3 * (1 / heightM) +
    a4 * weightKg
  );
}

/**
 * Compute predicted value, SD, and LLN for one DLCO parameter.
 * @param {number} age - Age in years (18–83).
 * @param {number} heightCm - Height in cm.
 * @param {number} weightKg - Weight in kg.
 * @param {number} sex - 1 = male, 2 = female.
 * @param {string} param - 'DLCO', 'DLCOVA', or 'VA'.
 * @returns {{ predicted: number, sd: number, lln: number }}
 */
export function dlcoCompute(age, heightCm, weightKg, sex, param) {
  const paramData = DLCO_COEFFICIENTS[param];
  if (!paramData) return { predicted: NaN, sd: NaN, lln: NaN };

  const sexKey = sex === 1 ? 'male' : 'female';
  const data = paramData[sexKey];
  if (!data) return { predicted: NaN, sd: NaN, lln: NaN };

  const heightM = heightCm / 100;

  const predicted = computeValue(data.mean, age, heightM, weightKg);
  const lln = computeValue(data.lln, age, heightM, weightKg);
  const sd = (predicted - lln) / 1.645;

  return { predicted, sd, lln };
}

/**
 * Compute z-score for a DLCO parameter.
 */
export function dlcoZscore(age, heightCm, weightKg, sex, param, observed) {
  const { predicted, sd } = dlcoCompute(age, heightCm, weightKg, sex, param);
  return (observed - predicted) / sd;
}

/**
 * Compute percent predicted for a DLCO parameter.
 */
export function dlcoPctPred(age, heightCm, weightKg, sex, param, observed) {
  const { predicted } = dlcoCompute(age, heightCm, weightKg, sex, param);
  return (observed / predicted) * 100;
}
