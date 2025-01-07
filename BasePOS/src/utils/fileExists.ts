import {PathLike} from 'node:fs';
import {dirname, parse} from 'node:path';

/** created because of need to check if file exists regardless of file extension
 * @param {PathLike} fullPath
 * @return {Promise<boolean>}
 */
async function fileExists(fullPath: PathLike): Promise<boolean> {
  if (typeof window !== 'undefined') {
    // Browser environment
    console.warn('fileExists function is not supported in the browser environment.');
    return false;
  } else {
    // Node.js environment
    const {readdirSync} = await import('node:fs');
    const directory = dirname(String(fullPath));
    const files = readdirSync(directory);
    const fileName = parse(String(fullPath)).name;

    for (const file of files) {
      const fileWithoutExtension = parse(file).name;
      if (fileWithoutExtension === fileName) {
        return true;
      }
    }

    return false;
  }
}

export default fileExists;
