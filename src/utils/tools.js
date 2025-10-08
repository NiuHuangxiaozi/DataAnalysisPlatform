/**
 * 函数 1：获取两个数组的全局最小值和最大值（忽略 null / undefined / 非数字 / NaN）。
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {{ min: number|null, max: number|null }}
 *          如果两个数组都没有有效数字，则返回 { min: null, max: null }。
 */
export function getGlobalMinMax(arr1, arr2) {
  // 合并两个数组的内容
  const combined = [];

  if (Array.isArray(arr1)) {
    for (const v of arr1) {
      if (v != null && typeof v === 'number' && !Number.isNaN(v)) {
        combined.push(v);
      }
    }
  }
  if (Array.isArray(arr2)) {
    for (const v of arr2) {
      if (v != null && typeof v === 'number' && !Number.isNaN(v)) {
        combined.push(v);
      }
    }
  }

  if (combined.length === 0) {
    // 没有任何有效数字
    return { min: null, max: null };
  }

  const min = Math.min(...combined);
  const max = Math.max(...combined);
  return { min, max };
}

/**
 * 函数 2：对一个数组进行 Min‐Max 归一化，使用给定的最小 / 最大值。
 * 忽略 null / undefined / 非数字 / NaN，保留原样在输出中。
 * @param {Array} arr — 要归一化的数组
 * @param {number|null} min — 最小值
 * @param {number|null} max — 最大值
 * @returns {Array} — 新数组，归一化后的数值（在 [0,1] 区间）或原样 null / undefined 等
 */
export function normalizeWithGivenMinMax(arr, min, max) {
  if (!Array.isArray(arr)) {
    throw new Error('输入必须是数组');
  }

  // 如果 min 或 max 为 null 或者 min === max 的情况，处理特殊情况
  if (min == null || max == null || min === max) {
    // 如果 min 或 max 无效，或所有值相同，则把所有有效数字统一映射为 0（也可以设为 0.5，依据需求）
    return arr.map(v => {
      if (v != null && typeof v === 'number' && !Number.isNaN(v)) {
        return 0;
      } else {
        return v;
      }
    });
  }

  const range = max - min;

  return arr.map(v => {
    if (v != null && typeof v === 'number' && !Number.isNaN(v)) {
      return (v - min) / range;
    } else {
      return v;
    }
  });
}

/**
 * 对两个数组做全局 Min‐Max 归一化。
 * @param {Array} arr1
 * @param {Array} arr2
 * @returns {{
 *   normalized1: Array,
 *   normalized2: Array,
 *   min: number|null,
 *   max: number|null
 * }}
 */
export function normalizeTwoArrays(arr1, arr2) {
  const { min, max } = getGlobalMinMax(arr1, arr2);

  const normalized1 = normalizeWithGivenMinMax(arr1, min, max);
  const normalized2 = normalizeWithGivenMinMax(arr2, min, max);

  return {
    normalized1,
    normalized2,
  };
}
