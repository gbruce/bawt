import { MakeVector3 } from 'bawt/utils/Math';
import { Property } from 'bawt/utils/Property';
import { IVector3 } from 'interface/IVector3';
import { injectable } from 'inversify';

export interface ILocation {
  position: IVector3;
  map: string;
}

@injectable()
export class PlayerState {
  public location: Property<ILocation> = new Property<ILocation>({
    position: MakeVector3(0, 0, 0),
    map: '',
  });
}
