#!/bin/bash
# example: ./changeVersionToPublish.sh 1.0.0

set -e

if [ -z "$1" ]; then
  echo "❌ Error: No version number provided."
  echo "Usage: $0 <version>"
  exit 1
fi

VERSION=$1
echo "⬆️ The new version to publish is: $VERSION and the OS is: $OSTYPE"

update_version() {
  # Create a temp file to avoid issues with sed -i differences
  local temp_file
  temp_file=$(mktemp)

  # List of specific modules
  local modules=("sdk" "contracts" "cli" "web" "backend")

  # Loop through each module
  for module in "${modules[@]}"; do
    # Find package.json files in the specified module directories (one level deep)
    find "./$module" -maxdepth 1 -name "package.json" -type f | while read -r file; do
      # Use sed to update the version in the package.json and store the result in a temp file
      sed "s/\"version\": \".*\"/\"version\": \"$VERSION\"/g" "$file" > "$temp_file"
      # Move the temp file back to overwrite the original file
      mv "$temp_file" "$file"
    done
  done

  # Clean up temp file
  rm -f "$temp_file"
}

# Run update_version function based on platform
if [[ "$OSTYPE" == "darwin"* || "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "msys" ]]; then
  # Works for macOS, Linux, and Git Bash on Windows
  update_version
else
  echo "❌ Error: Unsupported OS type: $OSTYPE"
  exit 1
fi

echo "✅ Version updated successfully."
