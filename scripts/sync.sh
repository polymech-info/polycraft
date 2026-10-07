osr-sync sync --logLevel=debug --clear=false --source='.' --target='../astro-playground' --debug=false --profile="./sync-playground.json"
cd ../astro-playground
git add -A .
git commit -m "Synced from site"
git push

# osr-sync sync --logLevel=debug --clear=false --source='.' --target='../guides' --debug=false --profile="./sync-playground.json"
#cd ../guides
#git add .
#git commit -m "Synced from site"
#git push
