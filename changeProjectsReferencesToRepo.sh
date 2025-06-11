#!/bin/bash
# example: ./changeVersionToPublish.sh 1.0.0

# Get the version from package.json
version=$(node -p -e "require('./package.json').version")

# Define an array of package names
packages=(
  "@hashgraph/stablecoin-npm-sdk"
  "@hashgraph/stablecoin-npm-contracts"
)

# Function to update the version in package.json files
update_version() {
  local package=$1
  local version=$2

  # Find all package.json files, excluding node_modules and example directories
  find . -path ./node_modules -prune -o -name "package.json" -type f | grep -v node_modules | grep -v example | while read -r file; do
    if [[ "$OSTYPE" == "darwin"* ]]; then
      # For macOS, use the correct sed syntax with no backup file
      sed -i '' "s|\"$package\": \".*\"|\"$package\": \"$version\"|g" "$file"
    else
      # For Linux/Windows, use the default sed -i syntax
      sed -i "s|\"$package\": \".*\"|\"$package\": \"$version\"|g" "$file"
    fi
  done
}

# Update the version for each package
for package in "${packages[@]}"; do
  update_version "$package" "$version"
done
