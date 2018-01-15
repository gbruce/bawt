import ObjectUtil from './ObjectUtil';
import { NewLogger } from '../utils/Logger';

const log = NewLogger('utils/Version');

export enum Version {
  None = '',
  WoW_1_12_1 = '1.12.1',
  WoW_3_3_5 = '3.3.5',
}

let initialized = false;
let currentVersion = Version.None;

export function SetVersion(version: string): boolean {
  if (!initialized) {
    switch (version) {
      case Version.None:
        currentVersion = Version.None;
        break;
      case Version.WoW_1_12_1:
        currentVersion = Version.WoW_1_12_1;
        break;
      case Version.WoW_3_3_5:
        currentVersion = Version.WoW_3_3_5;
        break;
    }

    if (currentVersion !== Version.None) {
      initialized = true;
      log.info('Version set to ' + currentVersion);
      return true;
    }

    return false;
  }

  return false;
}

export function GetVersion(): Version {
  if (!initialized) {
    throw new Error('Version must be initialized first.');
  }
  return currentVersion;
}
