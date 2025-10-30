
#!/bin/bash

# Create a tar.gz archive containing all project files
tar -czf project-archive.tar.gz \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='build' \
  --exclude='dist' \
  --exclude='.next' \
  --exclude='coverage' \
  --exclude='.cache' \
  --exclude='*.tar.gz' \
  --exclude='*.zip' \
  .

echo "Archive created: project-archive.tar.gz"
