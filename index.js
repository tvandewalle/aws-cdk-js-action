const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github')
// most @actions toolkit packages have async methods
async function run() {
  try {
    // Get inputs
    const cdkVersion = core.getInput('cdk_version');
    const cdkCommand = core.getInput('cdk_command');

    // Install AWS CDK
    await exec.exec(`npm install -g aws-cdk@${cdkVersion}`);

    // Install dependencies
    await exec.exec('npm ci');

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

    // Set CDK CLI Output
    core.setOutput('status_code', exitCode.toString());

    // Comment on Pull Request
    if (github.context.eventName == "pull_request") {
      github.rest.issues.createComment({
        issue_number: github.context.issue.number,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        body: commandOut,
      });
    }
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
