module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --color --quiet',
    'prettier --config ./.prettierrc --write',
    // 'react-scripts test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    () => 'tsc-files --noEmit',
  ],
  '*.{json,css}': ['prettier --config ./.prettierrc --write'],
}
