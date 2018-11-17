import test from 'ava';
import * as Figma from 'figma-js';
import * as testFile from './test-case.json';
import generateTheme, { camelize, toColorString } from '..';

test('camelize', t => {
  t.is(camelize('Good Day'), 'goodDay', 'Camelize words with space');
  t.is(camelize('Tim’s_Color'), 'timsColor', 'Camelize words with underscore');
});

test('rgbaToString', t => {
  const white: Figma.Color = { r: 1, g: 1, b: 1, a: 1 };
  const opaque: Figma.Color = { r: 1, g: 0.4, b: 0.23, a: 0.3 };
  const longFloat: Figma.Color = { r: 1, g: 0.4, b: 0.23, a: 0.023222 };

  t.is(toColorString(white), '#ffffff', 'Converts to hex');
  t.is(
    toColorString(opaque),
    'rgba(255,102,58,0.3)',
    'Converts to rgba when there is alpha',
  );
  t.is(
    toColorString(longFloat),
    'rgba(255,102,58,0.02)',
    'Rounds long alpha floats',
  );
});

test('generates colors', t => {
  const theme = generateTheme(testFile as any);
  t.is(Object.keys(theme.colors!).length, 6, 'Have exactly five colors');
});

test('generates radii', t => {
  const theme = generateTheme(testFile as any);
  t.deepEqual(theme.radii, ['12px 4px 12px 4px', 4]);
});

test('generates lineHeights', t => {
  const theme = generateTheme(testFile as any);
  t.deepEqual(theme.lineHeights, [1.2]);
});

test('generates fontWeights', t => {
  const theme = generateTheme(testFile as any);
  t.deepEqual(theme.fontWeights, [400, 500, 700]);
});

test('generates fontSizes', t => {
  const theme = generateTheme(testFile as any);
  t.deepEqual(theme.fontSizes, [12, 14, 72]);
});

test('generates letter spacings', t => {
  const theme = generateTheme(testFile as any);
  t.deepEqual(theme.letterSpacings, ['-0.04em', 0]);
});

test('generates boxShadows', t => {
  const theme = generateTheme(testFile as any);
  t.snapshot(theme.boxShadows, 'Has correct box shadows');
});
