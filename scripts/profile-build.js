const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create temp directory if it doesn't exist
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

function profileBuild() {
  console.log('Starting build profiling...\n');

  const startTime = new Date();
  const timestamp = startTime.getTime();

  // Run the build command with profiling flags
  const buildResult = spawnSync('npm', [
    'run',
    'build',
    '--',
    '--node-options=--cpu-prof --heap-prof --trace-gc --no-logfile-per-isolate --log-internal-timer-events --log-timer-events --prof'
  ], {
    stdio: ['inherit', 'pipe', 'pipe'],
    encoding: 'utf8',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  const endTime = new Date();
  const duration = (endTime - startTime) / 1000;

  // Process profiling data
  try {
    // Find and process the CPU profile
    const cpuProfiles = fs.readdirSync('.').filter(f => f.endsWith('.cpuprofile'));
    if (cpuProfiles.length > 0) {
      const profileFile = path.join(tempDir, 'cpu-last.cpuprofile');
      fs.renameSync(cpuProfiles[0], profileFile);
      console.log('CPU profile saved:', profileFile);
    } else {
      console.log('No CPU profile found');
    }

    // Find and process heap snapshots
    const heapFiles = fs.readdirSync('.').filter(f => f.endsWith('.heapprofile'));
    if (heapFiles.length > 0) {
      const heapFile = path.join(tempDir, 'heap-last.heapprofile');
      fs.renameSync(heapFiles[0], heapFile);
      console.log('Heap snapshot saved:', heapFile);
    } else {
      console.log('No heap snapshot found');
    }

    // Find and process v8.log
    const v8Logs = fs.readdirSync('.').filter(f => f.startsWith('v8.log'));
    if (v8Logs.length > 0) {
      const logFile = path.join(tempDir, 'v8-last.log');
      fs.renameSync(v8Logs[0], logFile);
      console.log('V8 log saved:', logFile);
    } else {
      console.log('No V8 log found');
    }

    // Generate markdown report
    const reportContent = generateMarkdownReport({
      startTime,
      endTime,
      duration,
      output: buildResult.stdout || '',
      error: buildResult.stderr || '',
      status: buildResult.status === 0 ? 'Success' : 'Failed',
      cpuProfiles: cpuProfiles.length > 0 ? ['cpu-last.cpuprofile'] : [],
      heapFiles: heapFiles.length > 0 ? ['heap-last.heapprofile'] : [],
      v8Logs: v8Logs.length > 0 ? ['v8-last.log'] : []
    });

    fs.writeFileSync(path.join(tempDir, 'report-build.md'), reportContent);

    console.log('\nBuild profiling completed.');
    console.log(`Profile data saved in: ${tempDir}`);
    console.log(`Markdown report saved at: ${path.join(tempDir, 'report-build.md')}\n`);

    if (buildResult.status !== 0) {
      console.error('Build failed with error:');
      console.error(buildResult.stderr);
      process.exit(1);
    }
  } catch (err) {
    console.error('Error processing profile data:', err);
    process.exit(1);
  }
}

function generateMarkdownReport({ startTime, endTime, duration, output, error, status, cpuProfiles, heapFiles, v8Logs }) {
  const durationMinutes = Math.floor(duration / 60);
  const durationSeconds = (duration % 60).toFixed(2);

  return `# Astro Build Performance Report

## Build Information

- **Start Time:** ${startTime.toLocaleString()}
- **End Time:** ${endTime.toLocaleString()}
- **Duration:** ${durationMinutes}m ${durationSeconds}s
- **Build Status:** ${status === 'Success' ? '✅ Success' : '❌ Failed'}

## Profile Data

${cpuProfiles.length > 0 ? `### CPU Profiles
CPU profiles are available in:
${cpuProfiles.map(file => `- \`${file}\``).join('\n')}

To analyze the CPU profiles:
1. Open Chrome DevTools
2. Go to the Performance tab
3. Click "Load profile..."
4. Select a CPU profile file from the temp directory

` : ''}

${heapFiles.length > 0 ? `### Heap Snapshots
Heap snapshots are available in:
${heapFiles.map(file => `- \`${file}\``).join('\n')}

To analyze the heap snapshots:
1. Open Chrome DevTools
2. Go to the Memory tab
3. Click "Load..."
4. Select a heap snapshot file from the temp directory

` : ''}

${v8Logs.length > 0 ? `### V8 Logs
V8 execution logs are available in:
${v8Logs.map(file => `- \`${file}\``).join('\n')}

To analyze the V8 logs:
1. Use Node.js's built-in profiler tools
2. Run \`node --prof-process <log-file>\` to process the logs
3. Review the generated report for execution statistics

` : ''}

## Build Output

\`\`\`
${output}
\`\`\`

${error ? `## Build Errors\n\`\`\`\n${error}\n\`\`\`\n` : ''}

## Recommendations

1. **Build Process Optimization**
   - Enable parallel processing where available
   - Implement build caching
   - Consider using bundling for frequently used modules

2. **Resource Management**
   - Review and optimize memory-intensive operations
   - Consider implementing lazy loading for large modules
   - Monitor and optimize garbage collection patterns

3. **Performance Monitoring**
   - Set up continuous performance monitoring
   - Track build times over time
   - Monitor resource usage during builds
`;
}

profileBuild(); 