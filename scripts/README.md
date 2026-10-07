# File Deployment Script

A simple deployment script that uses Node-SSH to:

1. Upload a file from `./releases/dist.zip` to `/var/vhosts/polymech.io/httpdocs`
2. Unzip the file on the server

## Prerequisites

- Node.js
- NPM

## Installation

```bash
npm install
```

## Configuration

Edit the `config.json` file with your server credentials:

```json
{
	"server": {
		"host": "your-server-host",
		"username": "your-username",
		"password": "your-password",
		"port": 22
	}
}
```

## Usage

```bash
npm run deploy
```

## Note

For security, `config.json` is included in `.gitignore` to prevent sensitive credentials from being committed to version control.

