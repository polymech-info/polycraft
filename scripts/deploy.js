/**
 * Deployment Script
 * Uploads dist.zip to server and unzips it
 */

const { NodeSSH } = require('node-ssh');
const fs = require('fs');
const path = require('path');

// Load credentials from config.json
const config = require('./config.json');

// Paths
const localFilePath = './releases/dist.zip';
const remoteDirectory = '/var/www/vhosts/polymech.io/httpdocs';
const remoteFilePath = `${remoteDirectory}/dist.zip`;

const ssh = new NodeSSH();

/**
 * Main deployment function
 */
async function deploy() {
  try {
    // Check if the local file exists
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File ${localFilePath} not found`);
    }

    console.log('Connecting to server...');
    await ssh.connect({
      host: config.server.host,
      username: config.server.username,
      password: config.server.password,
      port: config.server.port
    });

    // Upload the file
    console.log(`Uploading ${localFilePath} to ${remoteFilePath}...`);
    await ssh.putFile(localFilePath, remoteFilePath);

    // Unzip the file
    console.log(`Unzipping file on server...`);
    await ssh.execCommand(`unzip -o ${remoteFilePath} -d ${remoteDirectory}`);

    // Optional: Clean up the zip file after extraction
    console.log(`Removing zip file...`);
    await ssh.execCommand(`rm ${remoteFilePath}`);

    console.log('Deployment completed successfully!');
  } catch (error) {
    console.error('Deployment failed:', error);
  } finally {
    // Close the connection
    ssh.dispose();
  }
}

deploy();
