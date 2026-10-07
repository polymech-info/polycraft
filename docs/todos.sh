## Gallery
#kbotd --prompt=./Gallery.md --mode=completion --dst=./GalleryK.astro --filters=code --router=openai --model=gpt-4o
#kbotd --prompt=./Gallery.md --mode=completion --dst=./GalleryK2.astro --filters=code --include=./GalleryS.astro --router=openai --model=gpt-4o
#kbotd --prompt=./Lightbox.md --mode=completion --dst=./GalleryL.astro --filters=code --include=./GalleryM.astro  --include=./lightbox.html --router=openai --model=gpt-4o
#kbotd --prompt=./todos.md --mode=completion --dst=./GalleryL2.astro --filters=code --include=./GalleryL.astro  --model=openai/o1

#kbotd --prompt=./todos.md --include=resources.astro --filters=code

## RTL
#kbotd --prompt=./todos.md --preferences=./preferences.md --mode=completion --dst=./rtl.md
#kbotd --prompt=./todos.md --preferences=./preferences.md --mode=completion --dst=./rtl-culture.md  --model=openai/o3-mini

## Maps
#kbotd --prompt=./todos-map.md --preferences=./preferences.md --mode=completion --dst=./maps.md --model=anthropic/claude-3.7-sonnet:thinking

## Pics

kbotd --prompt=./todos-images.md --preferences=./preferences.md --mode=completion --dst=./image-to-text.md --model=openai/gpt-4.5-preview



