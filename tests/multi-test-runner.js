// test-runner.js
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runTests() {
  const runners = [
    { name: 'Node', cmd: 'node', args: ['--test', 'deflist.src.test.js'] },
    { name: 'Bun', cmd: 'bun', args: ['test', 'deflist.src.test.js'] },
    { name: 'Deno', cmd: 'deno', args: ['test', '--allow-all', 'deflist.src.test.js'] }
  ];

  for (const runner of runners) {
    console.log(`\n🚀 Running tests with ${runner.name}...`);
    
    try {
      const result = await new Promise((resolve) => {
        const child = spawn(runner.cmd, runner.args, { 
          cwd: __dirname,
          stdio: 'pipe'
        });

        let output = '';
        child.stdout.on('data', (data) => output += data);
        child.stderr.on('data', (data) => output += data);

        child.on('close', (code) => {
          resolve({ code, output });
        });
      });

      console.log(result.output);
      console.log(`✅ ${runner.name} exited with code: ${result.code}`);
    } catch (error) {
      console.error(`❌ Error running ${runner.name}:`, error.message);
    }
  }
}

runTests();
