const { execSync } = require("node:child_process");

const dir = __dirname;
const cliDir = `${dir}/cli`;
const webDir = `${dir}/web`;
const sdkDir = `${dir}/sdk`;
const conDir = `${dir}/contracts`;

const handleError = (error, stdout, stderr) => {
  if (error) {
    console.error(error);
  }
  console.log(stdout);
  console.error(stderr);
};

const npmInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && npm install`, handleError);
  console.log("\tDone");
};

npmInstall(cliDir, "CLI");
npmInstall(sdkDir, "SDK");
npmInstall(webDir, "WEB");
npmInstall(conDir, "CONTRACTS");
