
#!/bin/bash

# Create a zip file containing all project files
zip -r project-archive.zip . \
  -x "*.git/*" \
  -x "*node_modules/*" \
  -x "*/build/*" \
  -x "*/dist/*" \
  -x "*/.next/*" \
  -x "*/coverage/*" \
  -x "*/.cache/*" \
  -x "*.zip"

echo "Archive created: project-archive.zip"
