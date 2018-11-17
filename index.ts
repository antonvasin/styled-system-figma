import { FileResponse, Color, Text, Node, Rectangle, Effect } from 'figma-js';
import namer from 'color-namer';

const uniq = <T>(list: T[]) => list.filter((x, i, a) => a.indexOf(x) === i);

const isSingleValue = (list: number[]) => uniq(list).length === 1;

const toPx = (val: number) => (val !== 0 ? val + 'px' : '0');

const toEm = (letterSpacing: number) =>
  letterSpacing === 0 ? 0 : (letterSpacing / 16).toFixed(2) + 'em';

export const normalizeRgba = (num: number) => Math.floor(num * 255);

export const toRgbaString = (node: Color) =>
  `rgba(${normalizeRgba(node.r)},${normalizeRgba(node.g)},${normalizeRgba(
    node.b,
  )},${Number(node.a.toFixed(2))})`;

export const toBoxShadow = (effect: Effect) =>
  effect.type === 'DROP_SHADOW'
    ? `${toPx(effect!.offset!.x)} ${toPx(effect!.offset!.y)} ${toPx(
        effect.radius,
      )} ${toColorString(effect.color!)}`
    : `inset ${toPx(effect.offset!.x!)} ${toPx(effect.offset!.y!)} ${toPx(
        effect.radius,
      )} ${toColorString(effect.color!)}`;

export const isColor = (node: any): node is Color =>
  node.r && node.g && node.b && node.a;

export const isText = (node: Node): node is Text => node.type === 'TEXT';

export const isRectangle = (node: Node): node is Rectangle =>
  node.type === 'RECTANGLE';

const hasEffects = (node: any) => node.effects && node.effects.length !== 0;

export const isShadow = (node: Effect) =>
  node.type === 'DROP_SHADOW' || node.type === 'INNER_SHADOW';

const toHex = (num: number) => normalizeRgba(num).toString(16);

export const toColorString = (node: Color) =>
  node.a === 1
    ? `#${toHex(node.r)}${toHex(node.g)}${toHex(node.b)}`
    : toRgbaString(node);

const isEmpty = (node: any) => !node || Object.keys(node).length === 0;

const capitalize = (str: string) => `${str[0].toUpperCase()}${str.substr(1)}`;

export const camelize = (str: string) =>
  str
    .replace(/[`'”“’‘,."]+/, '')
    .replace(/_/, ' ')
    .split(' ')
    .map((word, i) => (i === 0 ? word.toLowerCase() : capitalize(word)))
    .join('');

interface StyledSystemTheme {
  colors?: { [index: string]: string };
  lineHeights?: number[];
  fontWeights?: number[];
  fontSizes?: number[];
  radii?: Array<number | string>;
  letterSpacings?: Array<string | number>;
  boxShadows?: string[];
}

function walk(node: any, cb: (node: any) => any) {
  if (isEmpty(node) || typeof node === 'string' || typeof node === 'number') {
    return;
  }

  cb(node);

  if (Array.isArray(node)) {
    node.forEach(el => walk(el, cb));
  } else {
    Object.values(node).forEach(v => walk(v, cb));
  }
}

function getColors(node: any) {
  const colors = new Set<string>();
  walk(node, n => {
    if (n.color && isColor(n.color)) {
      colors.add(toColorString(n.color));
    }
  });

  return [...colors].reduce(
    (acc: any, color: string) => ({
      ...acc,
      [camelize(namer(color).ntc[0].name)]: color,
    }),
    {},
  );
}

function getTypography(node: any): Partial<StyledSystemTheme> {
  const lineHeights = new Set<number>();
  const fontWeights = new Set<number>();
  const fontSizes = new Set<number>();
  const letterSpacings = new Set<string | number>();

  walk(node, n => {
    if (!isText(n)) return;

    lineHeights.add(n.style.lineHeightPercent / 100);
    fontWeights.add(n.style.fontWeight);
    fontSizes.add(n.style.fontSize);
    letterSpacings.add(toEm(n.style.letterSpacing));
  });

  return {
    lineHeights: [...lineHeights].sort(),
    fontWeights: [...fontWeights].sort(),
    fontSizes: [...fontSizes].sort(),
    letterSpacings: [...letterSpacings].sort(),
  };
}

function getRadii(node: any) {
  const radii = new Set<number | string>();

  walk(node, n => {
    if (isRectangle(n) && !!(n as any).rectangleCornerRadii) {
      const corners: number[] = (n as any).rectangleCornerRadii;
      if (isSingleValue(corners)) {
        radii.add(uniq(corners)[0]);
      } else {
        radii.add(corners.map(toPx).join(' '));
      }
    }
  });

  return [...radii].sort();
}
function getBoxShadows(node: any) {
  const boxShadows = new Set<string>();

  walk(node, n => {
    if (!hasEffects(n)) return;
    n.effects.filter(isShadow).forEach((shadow: Effect) => {
      boxShadows.add(toBoxShadow(shadow));
    });
  });

  return [...boxShadows];
}

export default function generateTheme(file: FileResponse): StyledSystemTheme {
  const canvases = file.document.children;

  return {
    colors: getColors(canvases),
    ...getTypography(canvases),
    radii: getRadii(canvases),
    boxShadows: getBoxShadows(canvases),
  };
}
