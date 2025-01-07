const { src, dest, parallel } = require('gulp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { promisify } = require('util');
const { exec } = require('child_process');

var gulp = require("gulp");
var ts = require("gulp-typescript");



const packagesRepo = 'RuntimeModule/runtime/packages';
const distPath = 'RuntimeModule/runtime/dist';


const generatePackageExports = gulp.series(BuildRuntimePackage,  function(done) {

  exec("node scripts/generate.js", (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return done(err);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

  });
  done();
  
});

function BuildRuntimePackage(done) {

  const packagePaths = glob.sync(`${packagesRepo}/*/tsconfig.json`);
  for (const packagePath of packagePaths) {
    console.log('Building package:', packagePath);
    const packageDir = path.dirname(packagePath);
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const packageName = packageJson.name | path.dirname(packagePath); 
      //make dist folder if it doesnt exist

    fs.mkdir(packageDir + '/dist' , { recursive: true }, (err) => {
      if (err) throw err;
    });

    var tsProject = ts.createProject(packagePath);
    return tsProject.src().pipe(tsProject()).js.pipe(gulp.dest(packageDir + '/dist'));

  }
  done();
  
};

function BuildRuntime(done) {
  // Get all package.json files
  const packagePaths = glob.sync(`${packagesRepo}/*/package.json`);
  
  for (const packagePath of packagePaths) {
      const packageDir = path.dirname(packagePath);
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      if (!packageJson.name) throw new Error('Package name is required in package.json: ' + packagePath);
      const packageName = packageJson.name;
      
      console.log('moving package:', packageName);


      // Generate hash from package name and version
      const hash = crypto
          .createHash('md5')
          .update(`${packageJson.name}${packageJson.version}`)
          .digest('hex')
          .slice(0, 8);
      
          
      // Create unique dist folder
      const distDir = path.join(distPath, `${packageName}-${hash}`);
      
      // Copy build output
      src(`${packageDir}/dist/**/*`)
          .pipe(dest(distDir));

  }
  done();
  
}

//start next server at masterpos
function startNextServer(done) {
  exec("cd masterpos && npm run dev", (err, stdout, stderr) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return done(err);
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);

  });
  done();
  
}

exports.BuildRuntime = BuildRuntime;
exports.generatePackageExports = generatePackageExports
exports.default = gulp.series(generatePackageExports, BuildRuntime);