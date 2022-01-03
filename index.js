const core = require('@actions/core');
const exec = require('@actions/exec');
const io = require('@actions/io');

// most @actions toolkit packages have async methods
async function run() {
  try {
    // Get inputs
    const cdkVersion = core.getInput('cdk_version');
    const cdkCommand = core.getInput('cdk_command');

    // Install AWS CDK
    await exec.exec(`npm install -g aws-cdk@${cdkVersion}`);

    // Run Command
    let commandOut = '';
    let commandErr = '';

    const options = {};
    options.listeners = {
      stdout: (data) => {
        commandOut += data.toString();
      },
      stderr: (data) => {
        commandErr += data.toString();
      }
    };
    let exitCode = await exec.exec('cdk', [cdkCommand], options);
    console.log(`\nCommand Output:\n ${commandOut}`);
    console.log(`Command Error:\n ${commandErr}`)

    // Set CDK CLI Output
    core.setOutput('status_code', exitCode.toString());

    //Find Python
    const pythonPath = await io.which('python', true);
    console.log(pythonPath);

    const javaPath = await io.which('java', true);
    console.log(javaPath);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
