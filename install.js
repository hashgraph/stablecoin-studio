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
};

const npmInstall = (dir, name = "module") => {
  process.stdout.write(`Installing dependencies for ${name}...`);
  execSync(`cd ${dir} && npm install`, handleError);
  console.log("\tDone");
};

let option = process.argv.slice(2)[0];

if (option) {
  npmInstall(`${dir}/${option}`, option.toUpperCase());
} else {
  npmInstall(cliDir, "CLI");
  npmInstall(sdkDir, "SDK");
  npmInstall(webDir, "WEB");
  npmInstall(conDir, "CONTRACTS");
}
