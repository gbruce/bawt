
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
    this._archive = Archive.build('/Applications/WoW-1.12.1-enUS-Mac/Data');
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

  private blp(req: Request, res: Response) {
    BLP.from(req.resource.data, (blp: any) => {
      const mipmap = blp.largest;

      const png = new PNG({ width: mipmap.width, height: mipmap.height });
      png.data = mipmap.rgba;

      res.type('image/png');
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
    res.send(results);
  }

  private serve(req: any, res: any) {
    res.type(req.resource.name);
    res.send(req.resource.data);
  }
}

export default Pipeline;
