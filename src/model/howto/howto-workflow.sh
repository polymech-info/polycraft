kbotd --preferences ./todos-workflow.md \
      --include=./howto-model.ts \
      --include=./howto-ex.ts \
      --include=./howto_sample.json \
      --disable=terminal,git,npm,user,interact,email \
      --disableTools=read_files,list_files,file_exists \
      --model=anthropic/claude-3.7-sonnet:thinking \
      --mode_=completion \
      --filters=code
