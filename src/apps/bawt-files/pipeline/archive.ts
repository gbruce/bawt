import MPQ = require('blizzardry/lib/mpq');
import * as globby from 'globby';

enum MPQ_OPEN {
  READ_ONLY = 0x00000100,
  WRITE_SHARE = 0x00000200,
  USE_BITMAP = 0x00000400,
  NO_LISTFILE = 0x00010000,
  NO_ATTRIBUTES = 0x00020000,
  NO_HEADER_SEARCH = 0x00040000,
  FORCE_MPQ_V1 = 0x00080000,
  CHECK_SECTOR_CRC = 0x00100000,
}

enum MPQ_CREATE {
  LISTFILE = 0x00100000,
  ATTRIBUTES = 0x00200000,
  SIGNATURE = 0x00400000,
  ARCHIVE_V1 = 0x00000000,
  ARCHIVE_V2 = 0x01000000,
  ARCHIVE_V3 = 0x02000000,
  ARCHIVE_V4 = 0x03000000,
}

class Archive {
  private static CHAIN = [
    'common.MPQ',
    'common-2.MPQ',
    'expansion.MPQ',
    'lichking.MPQ',
    '*/locale-*.MPQ',
    '*/speech-*.MPQ',
    '*/expansion-locale-*.MPQ',
    '*/lichking-locale-*.MPQ',
    '*/expansion-speech-*.MPQ',
    '*/lichking-speech-*.MPQ',
    '*/patch-*.MPQ',
    'patch.MPQ',
    'patch-*.MPQ',
  ];
  private static Files = [
    '*/base-*.MPQ',
    'common.MPQ',
    'common-2.MPQ',
    'expansion.MPQ',
    'lichking.MPQ',
    '*/locale-*.MPQ',
    '*/speech-*.MPQ',
    '*/expansion-locale-*.MPQ',
    '*/lichking-locale-*.MPQ',
    '*/expansion-speech-*.MPQ',
    '*/lichking-speech-*.MPQ',
    '*/patch-*.MPQ',
    'patch.MPQ',
    'patch-2.MPQ',
    'patch-3.MPQ',
  ];

  public static build(root: string): MPQ|null {
    const patterns = this.Files.map((path) => {
      return `${root}/${path}`;
    });

    const archives = globby.sync(patterns);
    const firstArchive = archives.shift();

    if (firstArchive === undefined) {
      return null;
    }

    const base = MPQ.open(firstArchive, MPQ.OPEN.READ_ONLY);
    archives.forEach((archive: any) => {
      base.patch(archive, '');
    });
    return base;
  }

}

export default Archive;
