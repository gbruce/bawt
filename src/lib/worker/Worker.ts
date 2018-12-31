import 'reflect-metadata';
import ADT = require('blizzardry/lib/adt');
import * as WMO from 'blizzardry/lib/wmo';
import * as WMOGroup from 'blizzardry/lib/wmo/group';
import * as M2 from 'blizzardry/lib/m2';
import * as Skin from 'blizzardry/lib/m2/skin';
import { worker } from 'workerpool';
import { NewLogger } from 'bawt/utils/Logger';
import { HttpService } from 'bawt/utils/browser/HttpService';
import { IWorkerRequest, AssetType } from 'interface/IWorkerRequest';

const log = NewLogger('worker');

const read = async (host: string, port: number, request: IWorkerRequest): Promise<any> => {
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
  }
};

worker({
  read,
});
