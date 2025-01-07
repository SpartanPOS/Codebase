import runtime from './runtime/index.json';
import path from 'node:path';
import fileExists from '@/utils/fileExists';
import {promises as fs} from 'fs';
import {PathLike} from 'node:fs';

export interface viewInstance {
  name: string,
  relativePath: PathLike
}

/** solid immutable runtime that loads modules from the runtime folder */
class Runtime {
  readonly availableViews: Promise<viewInstance[]> = Promise.resolve([]);
  readonly viewModules: string[] = [];
  readonly commandModules: string[] = [];
  readonly commands: string[] = [];
  readonly runtimeName: string = 'SpartanPOS';

  /**
   * index all views and commandFunctions into the class immut variables
   */
  constructor() {
    [this.commandModules, this.viewModules] = this.populateModules();
    this.availableViews = (async () => await this.generateViewsIndex())();
  }

  /** populates the runtime view and command modules
   * @return {[[], []]}
   */
  populateModules() {
    return [runtime.commandModules, runtime.viewModules];
  }

  /** grabs viewExports from each viewModule's package.json. Will make it where it can also
   * grab from view folder if dev chooses to do so
   * @return {view[]}
   */
  async generateViewsIndex(): Promise<viewInstance[]> {
    console.info('Generating views index');
    const rootDir = path.relative(process.cwd(), 'runtime/packages');
    console.debug('Root dir: ' + rootDir);
    const availableViews = [];
    for (const moduleName of this.viewModules) {
      console.info('View module: ' + moduleName);
      const modulePath = path.join(rootDir, moduleName);

      const packageJsonPath = path.join(rootDir, moduleName, 'package.json');
      console.debug('Package.json found in module ' + moduleName);
      const packageJsonRaw = await fs.readFile(packageJsonPath, 'utf-8').catch((err) => {
        console.error(err);
        return null;
      });
      if (!packageJsonRaw) continue;

      const moduleJSON = JSON.parse(packageJsonRaw);

      for (const view of moduleJSON.spartanPOS.viewExports) {
        console.debug(`View: ${view.name}`);
        const viewPath: PathLike = path.join(modulePath, view.fullPath);

        if (await fileExists(viewPath)) {
          console.debug(`View path: ${viewPath}`);
          availableViews.push({name: view.name, relativePath: viewPath});
        } else {
          console.error('View ' + view.name + ' not found');
        };
      };
    }
    return availableViews;
  }
}

export default Object.freeze(await new Runtime());
