#!/bin/bash

# This script updates all imports from the global constants/categoryColors 
# to the local Assumptions constants/categoryColors

# Update CategoryProgressCard component imports
find src/app/pages/Concept/Report/Assumptions/components -type f -name "*.tsx" | xargs sed -i 's|../../../../../../constants/categoryColors|../../../constants/categoryColors|g'
find src/app/pages/Concept/Report/Assumptions/components -type f -name "*.tsx" | xargs sed -i 's|../../../../../../../constants/categoryColors|../../../constants/categoryColors|g'
find src/app/pages/Concept/Report/Assumptions/components -type f -name "*.tsx" | xargs sed -i 's|../../../../../../../../constants/categoryColors|../../../constants/categoryColors|g'
find src/app/pages/Concept/Report/Assumptions/components -type f -name "*.tsx" | xargs sed -i 's|../../../../../constants/categoryColors|../../constants/categoryColors|g'

# Update root level components
find src/app/pages/Concept/Report/Assumptions -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|../../../../../constants/categoryColors|./constants/categoryColors|g'
find src/app/pages/Concept/Report/Assumptions -maxdepth 1 -type f -name "*.tsx" | xargs sed -i 's|../../../../constants/categoryColors|./constants/categoryColors|g'

echo "All imports updated to use local constants/categoryColors" 