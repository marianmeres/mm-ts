# mm-ts

Ongoing collection of various personal TypeScript utils...

**Notes/links:**

- https://medium.com/@martin_hotell/tree-shake-lodash-with-webpack-jest-and-typescript-2734fa13b5cd
    1. use `import isDate from 'lodash-es/isDate'` syntax
    2. jest: transpile also .js files not just .ts: `"transform": {"^.+\\.(j|t)sx?$": "ts-jest"}`
    3. jest: whitelist lodash-es within transformIgnorePatterns: `"transformIgnorePatterns": ["<rootDir>/node_modules/(?!lodash-es/.*)"]`
    4. tsconfig.json - transpile js too... `"allowJs": true`
