#!/bin/bash

# Delete local and remote gh-pages branch
git branch -D gh-pages
git push -d origin gh-pages

npm run build
git checkout -b gh-pages

BUILD_DIR="./build"

# Make sure the build directory exists
if [ ! -d "$BUILD_DIR" ]; then
  echo "Error: '$BUILD_DIR' directory not found!"
  exit 1
fi

# Copy the contents of build into the current directory
# -r = recursive, -v = verbose (optional), -p = preserve file attributes (optional)
cp -rpv "$BUILD_DIR"/* .

echo "All contents from '$BUILD_DIR' have been copied to the current directory."

git add -A
git commit -m 'Deploying to gh-pages'
git push origin gh-pages

echo "Deployment commit has been pushed to gh-pages branch."
