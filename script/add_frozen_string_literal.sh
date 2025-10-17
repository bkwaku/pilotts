#!/bin/bash
# Script to add frozen_string_literal comment to Ruby files

set -e

echo "Adding frozen_string_literal: true to Ruby files..."

# Find all Ruby files in app/, spec/, config/, lib/ (excluding certain patterns)
find app spec config/initializers lib -type f -name "*.rb" | while read file; do
  # Check if file already has frozen_string_literal
  if ! grep -q "frozen_string_literal" "$file"; then
    # Add frozen_string_literal at the top of the file
    echo "# frozen_string_literal: true" | cat - "$file" > temp && mv temp "$file"
    echo "Added to: $file"
  else
    echo "Skipped (already has it): $file"
  fi
done

# Handle config files separately (environment.rb, application.rb, etc.)
find config -maxdepth 1 -type f -name "*.rb" | while read file; do
  if ! grep -q "frozen_string_literal" "$file"; then
    echo "# frozen_string_literal: true" | cat - "$file" > temp && mv temp "$file"
    echo "Added to: $file"
  else
    echo "Skipped (already has it): $file"
  fi
done

echo "Done! All Ruby files now have frozen_string_literal: true"
