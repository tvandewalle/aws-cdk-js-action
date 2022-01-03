const core = require('@actions/core');
const exec = require('@actions/exec');


// most @actions toolkit packages have async methods
async function run() {
  try {
    // Get inputs
    const cdkVersion = core.getInput('cdk_version');

    // Install AWS CDK
    await exec.exec(`npm install -g aws-cdk@${cdkVersion}`);

    // Set CDK CLI Output
    core.setOutput('status_code', '0');
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
