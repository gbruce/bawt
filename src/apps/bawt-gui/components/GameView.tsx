import * as React from 'react';
import { lazyInject } from 'bawt/Container';
import { GameHandler } from 'bawt/game/Handler';
import { ICharacter } from 'interface/ICharacter';

interface Props {
  character: ICharacter;
} 

export class GameView extends React.Component<Props, {}> {
  @lazyInject(GameHandler)
  private game!: GameHandler;
  
  public async componentDidMount() {
    await this.game.join(this.props.character);
  }

  render() {
    return (null);
  }
}
