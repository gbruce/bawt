import 'reflect-metadata';
import ADT = require('blizzardry/lib/adt');
import WMO from 'blizzardry/lib/wmo';
import WMOGroup from 'blizzardry/lib/wmo/group';
import M2 from 'blizzardry/lib/m2';
import Skin from 'blizzardry/lib/m2/skin';
import WDT from 'blizzardry/lib/wdt';
import { NewLogger } from 'bawt/utils/Logger';
import { HttpService } from 'bawt/utils/browser/HttpService';
import { IWorkerRequest, AssetType } from 'interface/IWorkerRequest';
import { expose } from 'threads';

const log = NewLogger('worker');

export const read = async (host: string, port: number, request: IWorkerRequest): Promise<any> => {
  const stream = await new HttpService(host, port).get(request.path);
  switch (request.type) {
    case AssetType.ADT:
      return ADT(request.flags).decode(stream);
    case AssetType.WMO:
      return WMO.decode(stream);
    case AssetType.WMOGroup:
      return WMOGroup.decode(stream);
    case AssetType.M2:
      return M2.decode(stream);
    case AssetType.Skin:
      return Skin.decode(stream);
    case AssetType.WDT:
      return WDT.decode(stream);
  }
};

expose(read);
