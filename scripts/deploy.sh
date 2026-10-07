#!/bin/bash

# Example script for Google Drive operations using rclone

# Define local and remote paths
LOCAL_DIR="./dist"
GDRIVE_DIR="library.polymech.info:/"

rclone copy "${LOCAL_DIR}" "${GDRIVE_DIR}" --progress --transfers 4
