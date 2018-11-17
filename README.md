# styled-system-figma

Generate theme file for [`styled-system`](https://github.com/jxnblk/styled-system) from Figma file.

## Install

```shell
yarn add styled-system-figma
# or
npm install --save styled-system-figma
```

## Example

```ts
import generateTheme from 'styled-system-figma';
import * as Figma from 'figma-js';

const fileId = 'FILE_ID';

const client = Figma.Client({
  personalAccessToken: 'FIGMA_TOKEN',
});

client.file(fileId).then(({ data }) => {
  const theme = generateTheme(data);

  fs.writeFileSync('theme.js', JSON.stringify(theme, null, 2));
});
```

## TODO

- [x] `colors`
- [x] `lineHeights`
- [x] `radii`
- [x] `fontSizes`
- [x] `fontWeights`
- [x] `letterSpacings`
- [ ] `fonts`
- [x] `boxShadows`
- [ ] parse styles for names
- [ ] `textVariants`
