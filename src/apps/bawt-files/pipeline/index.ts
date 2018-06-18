
// import { DecodeStream } from 'blizzardry/lib/restructure';
import { PNG } from 'pngjs';
import * as express from 'express';
import { Request, Response } from 'express-serve-static-core';
import BLP = require('blizzardry/lib/blp');
import MPQ  = require('blizzardry/lib/mpq');
import DBC = require('blizzardry/lib/dbc/entities');
import Restructure = require('blizzardry/lib/restructure');
import Archive from './archive';

// import ServerConfig from '../config';
// http://localhost:8000/pipeline/DUNGEONS\TEXTURES\ROOF\JACRYPTPILLAR.BLP
declare module 'express-serve-static-core' {
  // tslint:disable-next-line
  interface Request {
    resourcePath: string;
    resource?: any;
  }
}

class Pipeline {
  private _archive: MPQ|null;

  constructor(public router: express.Express = express()) {
    this.router.param('resource', this.resource);
    this.router.get('/:resource(*.blp).png', this.blp);
    this.router.get('/:resource(*.dbc)/:id(*)?.json', this.dbc);
    this.router.get('/find/:query', this.find);
    this.router.get('/:resource', this.serve);
    this._archive = Archive.build('/Applications/Wrath of the Lich King 3.3.5a/Data');
  }

  get archive() {
    return this._archive;
  }

  private resource = (req: Request, res: Response, next: express.NextFunction, path: any, name: string) => {
    if (this.archive == null) {
      throw new Error('no archive');
    }

    req.resourcePath = path;
    req.resource = this.archive.files.get(path);
    if (req.resource) {
      next();

      // Ensure file is closed in StormLib.
      req.resource.close();
    }
    else {
      res.status(404);
      res.send('resource not found');
    }
  }

  // BLP
  // http://localhost:8000/pipeline/DUNGEONS%5CTEXTURES%5CROOF%5CJACRYPTPILLAR.BLP.png
  //
  // WAV
  // http://localhost:8000/pipeline/Sound%5CInterface%5CFriendJoin.wav
  //
  // QUERY
  // http://localhost:8000/pipeline/find/textures%5CMinimap%5C77156e4a1da4729243916a1acb965973.blp
  //
  // M2
  // "World\NoDXT\Detail\DrkBus05.m2"
  // "Creature\Chimera\Chimera.M2"
  //
  // SKIN
  // "ITEM\OBJECTCOMPONENTS\WEAPON\Knife_1H_Coilfang_D_0100.skin"
  //
  // WMO
  // "World\wmo\Outland\OrcBuildings\outlandorcbarracks01.wmo"
  // "World\wmo\KhazModan\Cities\Ironforge\ironforge_018.wmo"
  // "World\wmo\Kalimdor\Ogrimmar\Ogrimmar_043.wmo"
  //
  // anim
  // "Creature\HighElf\HighElfMale_Hunter0103-00.anim"
  //
  // adt
  // "World\Maps\EmeraldDream\EmeraldDream_36_34.adt"
  //
  // bls(shader)
  // "shaders\Pixel\nvfp2\MapObjEnv.bls"
  // "shaders\Pixel\nvfp2\Terrain3.bls"
  //
  // mp3
  // "Sound\Music\ZoneMusic\IcecrownRaid\IR_WalkF_06.mp3"
  //
  // jpg
  // "Blizzard Downloader.app\Contents\Resources\downloader-splash.jpg"

  private blp(req: Request, res: Response) {
    BLP.from(req.resource.data, (blp: any) => {
      const mipmap = blp.largest;

      const png = new PNG({ width: mipmap.width, height: mipmap.height });
      png.data = mipmap.rgba;

      res.type('image/png');
      res.set('Access-Control-Allow-Origin', '*');
      png.pack().pipe(res);
    });
  }

  private dbc = (req: Request, res: Response) => {
    // filename:"DBFilesClient\Map.dbc/0.json"
    const match = req.resourcePath.match(/(\w+)\.dbc/);
    if (!match) {
      res.status(404);
      res.send('did not match resource path');
      return;
    }

    const name = match[1];
    const definition = DBC[name];
    if (definition) {
      const dbc = definition.dbc.decode(new Restructure.DecodeStream(req.resource.data));
      const id = req.params.id;
      if (id) {
        const search = dbc.records.find((entity: any) => {
          return String(entity.id) === id;
        });
        if (search) {
          res.send(search);
        }
        else {
          res.status(404);
          res.send('entity not found');
        }
      }
      else {
        res.set('Access-Control-Allow-Origin', '*');
        res.send(dbc.records);
      }
    }
    else {
      res.status(404);
      res.send('entity definition not found');
    }
  }

  private find = (req: Request, res: Response) => {
    if (this.archive === null) {
      res.status(404);
      res.send('archive not loaded');
      return;
    }

    const results = this.archive.files.find(req.params.query).map((result: any) => {
      const path = `${req.baseUrl}/${encodeURI(result.filename)}`;
      const link = `${req.protocol}://${req.headers.host}${path}`;
      return {
        filename: result.filename,
        name: result.name,
        size: result.fileSize,
        link,
      };
    });
    res.set('Access-Control-Allow-Origin', '*');
    res.send(results);
  }

  private serve(req: any, res: any) {
    res.type(req.resource.name);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(req.resource.data);
  }
}

export default Pipeline;
