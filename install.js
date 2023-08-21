const { execSync } = require("node:child_process");

const dir = __dirname;
const cliDir = `${dir}/cli`;
const webDir = `${dir}/web`;
const sdkDir = `${dir}/sdk`;
const conDir = `${dir}/contracts`;
const hashDir = `${dir}/hashconnect/lib`;
const defDir = `${dir}/defenders`;


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

const npmLinkProject = (dir) => {
  process.stdout.write(`Registering CLI as global command 'accelerator'...`);
  execSync(`cd ${dir} && npm link`, handleError);
  console.log("\tDone");
};
const npmBuild = (dir,name='module') =>{
  process.stdout.write(`Build for ${name}...`);
  execSync(`cd ${dir} && npm run build`, handleError);
  console.log("\tDone");
}

let option = process.argv.slice(2)[0];

if (option) {
  npmInstall(`${dir}/${option}`, option.toUpperCase());
} else {
  npmInstall(hashDir, "HASHCONNECT");
  npmBuild(hashDir, "HASHCONNECT");
  npmInstall(conDir, "CONTRACTS");
  npmInstall(sdkDir, "SDK");
  npmInstall(cliDir, "CLI");
  npmInstall(webDir, "WEB");
  npmInstall(defDir, "DEFENDERS");
}

// npmLinkProject(cliDir);
