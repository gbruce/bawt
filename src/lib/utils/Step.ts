import { Property } from 'bawt/utils/Property';
import { injectable } from 'inversify';

export interface IStep {
  delta: number;
  time: number;
}

@injectable()
export class Step {
  public step: Property<IStep> = new Property<IStep>({
    delta: 0,
    time: 0,
  });
}
