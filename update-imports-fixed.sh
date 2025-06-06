#!/bin/bash

# This script updates imports to point to the local constants directory

# Update the components/cards/category-progress-card directory
find src/app/pages/Concept/Report/Assumptions/components/cards/category-progress-card -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../../constants/categoryColors|g'

# Update the components/cards/category-progress-card/progress-bar directory
find src/app/pages/Concept/Report/Assumptions/components/cards/category-progress-card/progress-bar -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../../../constants/categoryColors|g'

# Update the components/cards directory
find src/app/pages/Concept/Report/Assumptions/components/cards -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../constants/categoryColors|g'

# Update the components/badges directory
find src/app/pages/Concept/Report/Assumptions/components/badges -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../constants/categoryColors|g'

# Update the components/shared directory
find src/app/pages/Concept/Report/Assumptions/components/shared -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../constants/categoryColors|g'

# Update the components/widgets directory
find src/app/pages/Concept/Report/Assumptions/components/widgets -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../constants/categoryColors|g'

# Update root components directory
find src/app/pages/Concept/Report/Assumptions/components -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../constants/categoryColors|g'

# Update the CategoryProgressCard directory
find src/app/pages/Concept/Report/Assumptions/components/CategoryProgressCard -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../constants/categoryColors|g'

# Update the CategoryProgressCard/ProgressBar directory
find src/app/pages/Concept/Report/Assumptions/components/CategoryProgressCard/ProgressBar -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|../../../../constants/categoryColors|g'

# Update the root Assumptions directory
find src/app/pages/Concept/Report/Assumptions -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|.*constants/categoryColors|./constants/categoryColors|g'

echo "All imports updated to use local constants/categoryColors" 