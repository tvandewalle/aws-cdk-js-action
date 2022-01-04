const fs = require('fs');
const core = require('@actions/core');
const exec = require('@actions/exec');
const github = require('@actions/github')

// most @actions toolkit packages have async methods
async function run() {
  try {
    // Get inputs
    const cdkVersion = core.getInput('cdk_version');
    const cdkCommand = core.getInput('cdk_command');
    const prComments = core.getBooleanInput('pr_comments');
    const cdkArguments = core.getInput('cdk_args'); 
    const cdkLanguage = core.getInput('cdk_language');

    // Install AWS CDK
    await exec.exec(`npm install -g aws-cdk@${cdkVersion}`);

    // Install dependencies
    if (cdkLanguage == 'typescript') {
      if (fs.existsSync('./package-lock.json')) {
        await exec.exec('npm ci');
      }
      if (fs.existsSync('./yarn.lock')) {
        await exec.exec('yarn install --immutable --immutable-cache --check-cache');
      }
    }

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
    let exitCode = await exec.exec('cdk', [cdkCommand].concat(cdkArguments), options);

    // Set CDK CLI Output
    core.setOutput('status_code', exitCode.toString());

    // Comment on Pull Request
    if (github.context.eventName == "pull_request" && prComments) {
      let commentBody = `<details><summary>Show Details</summary>
     
      \`\`\`
      ${commandOut}
      \`\`\`

      </details>`;

      const octokit = github.getOctokit(process.env.GITHUB_TOKEN);
      await octokit.rest.issues.createComment({
        issue_number: github.context.issue.number,
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        body: commandOut,
      });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
