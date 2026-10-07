#!/bin/bash

# Define repositories to commit to
# . refers to the current directory (polymech/site2)
# ../polymech-astro refers to the sibling directory
REPOS=("." "../polymech-astro")

# Store the optional commit message
MSG="$1"

# Iterate over each repository
for repo in "${REPOS[@]}"; do
  echo "--------------------------------------------------"
  echo "Processing repository: $repo"
  echo "--------------------------------------------------"
  
  # Execute in a subshell to preserve current directory
  (
    cd "$repo" || { echo "Failed to enter $repo"; exit 1; }
    
    # Add all changes
    git add -A .
    
    # Commit
    if [ -n "$MSG" ]; then
      git commit -m "$MSG"
    else
      # If no message provided, let git open the editor
      git commit
    fi
    
    # Pushing changes
    git push
  )
done
