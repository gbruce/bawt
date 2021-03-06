import { Container } from 'inversify';
import getDecorators from 'inversify-inject-decorators';

const container = new Container();
const { lazyInject } = getDecorators(container, false);

function GlobalContainer() {
  return container;
}

export { lazyInject, GlobalContainer };
