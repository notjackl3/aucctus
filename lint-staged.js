module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'eslint --color --quiet',
    // 'react-scripts test --bail --watchAll=false --findRelatedTests --passWithNoTests',
    () => 'tsc-files --noEmit',
  ],
  '*.js,*.jsx,*.ts,*.tsx,*.json,*.css': [
    'prettier --config .prettierrc --write',
  ],
}
