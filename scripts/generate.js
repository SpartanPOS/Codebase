const { createWriteStream, readFileSync } =  require('node:fs');
const { mkdtemp } = require('node:fs/promises');
const { join, dirname } = require('node:path');
const { tmpdir } = require('node:os');
const glob = require('glob');
const fs = require('fs');
const path = require('path');

/**foreach package in runtimemodule/runtime/packages open the package.json and 
 * create a export for each viewFunction and logicFunction
 */

const packagesRepo = 'RuntimeModule/runtime/packages';
const distPath = 'RuntimeModule/runtime/dist';



function findPackageDistFolder(packageName) {
    const distPath = path.join('RuntimeModule', 'runtime', 'dist');
    
    const dirs = fs.readdirSync(distPath)
        .filter(dir => dir.startsWith(packageName + '-'));
        // .map(dir => path.join(distPath, dir));
    
    if (dirs.length === 0) {
        throw new Error(`No dist folder found for package ${packageName}. Did you forget to build it?`);
    }
    
    // Return most recently modified if multiple matches
    return dirs.sort((a, b) => {
        return fs.statSync(b).mtime.getTime() - 
               fs.statSync(a).mtime.getTime();
    })[0];
}

async function generate() {
    const packagePaths = glob.sync(`${packagesRepo}/*/package.json`);
    const importLines = [];
    const exportLines = [];

    for (const packagePath of packagePaths) {
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
        const packageName = packageJson.name; 
        if (!packageName) throw new Error('Package name is required in package.json: ' + packagePath);
        console.log("including package: ", packageName);

        const includePath =  findPackageDistFolder(packageName);
        
        const posConfig = packageJson.spartanPOS;

        if (posConfig.viewExports) {
            posConfig.viewExports.forEach(view => {

                importLines.push(`import ${view.name} from './${includePath}';\n`);
                exportLines.push(view.name);
            });
        }
        if (posConfig.logics) {
            posConfig.logics.forEach(logic => {
                importLines.push(`import ${logic.name} from './${includePath}';`);
                exportLines.push(logic.name);
            });
        }
    }

    const importLinesString = importLines.join(' \n');
    const exportLinesString = exportLines.join(', \n');

    const fileStructure = `
    ${importLinesString}
    export { 
        ${exportLinesString}
    };
    `;

    const indexFile = fs.writeFile("./RuntimeModule/runtime/dist/index.js", fileStructure, (err) => console.log(err | 'done'));
        
    
}

generate();