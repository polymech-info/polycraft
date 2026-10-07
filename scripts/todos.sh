#kbotd --prompt=./Gallery.md --mode=completion --dst=./GalleryK.astro --filters=code --router=openai --model=gpt-4o
#kbotd --prompt=./Gallery.md --mode=completion --dst=./GalleryK2.astro --filters=code --include=./GalleryS.astro --router=openai --model=gpt-4o
#kbotd --prompt=./Lightbox.md --mode=completion --dst=./GalleryL.astro --filters=code --include=./GalleryM.astro  --include=./lightbox.html --router=openai --model=gpt-4o
#kbotd --prompt=./todos.md --mode=completion --dst=./GalleryL2.astro --filters=code --include=./GalleryL.astro  --model=openai/o1

#kbotd --prompt=./todos.md --include=resources.astro --filters=code
#kbotd --prompt=./todos.md --model=anthropic/claude-3.7-sonnet
# kbotd --prompt=./todos-merchant.md --model=anthropic/claude-3.7-sonnet --include=../../polymech-mono/packages/commons/src/component.ts
#--model=anthropic/claude-3.7-sonnet \
kbotd --preferences ./todos-merchant.md \
      --include=../../polymech-mono/packages/commons/src/component.ts \
      --disable=terminal,git,npm,user,interact,search,email,web \
      --disableTools=read_file,read_files,list_files,file_exists,web
