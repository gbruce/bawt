import ObjectUtil from './ObjectUtil';
import { NewLogger } from '../utils/Logger';

const Log = NewLogger('utils/Version');

export enum Version {
  None = '',
  WoW_1_12_1 = '1.12.1',
  WoW_3_3_5 = '3.3.5',
}

let initialized = false;
let currentVersion = Version.None;

export function SetVersion(version: string): boolean {
  if (!initialized) {
    initialized = true;

    switch (version) {
      case Version.None:
        currentVersion = Version.None;
        return true;
      case Version.WoW_1_12_1:
        currentVersion = Version.WoW_1_12_1;
        return true;
      case Version.WoW_3_3_5:
        currentVersion = Version.WoW_3_3_5;
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
