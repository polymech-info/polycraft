kbotd --preferences ./todos.md \
      --include=./howto.ts \
      --include=./howto-model.ts \
      --include=./annotation.ts \
      --include=./howto_sample.json \
      --disable=terminal,git,npm,user,interact,search,email,web \
      --disableTools=read_file,read_files,list_files,file_exists,web \
      --model=anthropic/claude-3.7-sonnet \
      --model_=gpt-4o \
      --router_=openai
