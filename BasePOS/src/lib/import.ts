import {open} from 'node:fs/promises';
import {unzip} from 'node:zlib';
import {PathLike} from 'node:fs';

export async function importPosModule(name: PathLike): Promise<void> {
  const fileHandle = await open(name, 'r');
  const buffer = await fileHandle.readFile();
  fileHandle.close();

  await new Promise<void>((resolve, reject) => {
    unzip(buffer, (err, unzipped) => {
      if (err) reject(err); else {
        file = unzipped; resolve();
      }
    });
  });

  // let signature = repo.checkSignature()
}
