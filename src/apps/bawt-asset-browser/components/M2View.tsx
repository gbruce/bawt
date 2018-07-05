import * as React from 'react';
import * as THREE from 'three';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { LoadM2 } from 'bawt/worker/LoadM2';
import { M2Model } from 'bawt/assets/m2/index';

interface IProps {
  filePath: string;
}

export class M2View extends React.Component<IProps, {}> {

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private threeRootElement: any;

  constructor(props: IProps) {
    super(props);
  }

  private renderer: THREE.WebGLRenderer|null = null;
  private scene: THREE.Scene|null = null;
  private camera: THREE.Camera|null = null;
  private model: M2Model|null = null;

  private maybeReleaseRenderer() {
    this.camera = null;
    this.scene = null;

    if (this.model !== null) {
      this.model!.dispose();
      this.model = null;
    }

    if (this.renderer !== null) {
      this.threeRootElement.removeChild(this.renderer.domElement);
      this.renderer.dispose();
      this.renderer = null;
    }
  }

  public componentWillUnmount() {
    this.maybeReleaseRenderer();
  }

  public async componentDidMount() {
    this.renderer = new THREE.WebGLRenderer();
    const canvas = this.renderer.domElement;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);

    this.renderer.setSize(700, 450);
    this.threeRootElement.appendChild(this.renderer.domElement);

    const axis = new THREE.AxesHelper(10);
    this.scene.add(axis);
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    this.scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 1.0);

    light2.position.set(-100, 100, -100);
    this.scene.add(light2);

    this.camera.position.x = 2;
    this.camera.position.y = 2;
    this.camera.position.z = 2;

    this.camera.lookAt(this.scene.position);

    this.animate(0);

    const loader = new LoadM2(this.httpService);
    const mesh = await loader.Start(this.props.filePath);
    this.model = new M2Model(this.props.filePath, mesh.m2, mesh.skin);

    this.scene.add(this.model);
  }

  public async componentWillUpdate?(nextProps: IProps, nextState: {}, nextContext: any) {
    if (nextProps.filePath !== this.props.filePath) {
      if (this.renderer !== null && this.scene !== null) {
        if (this.model !== null) {
          this.scene.remove(this.model);
          this.model.dispose();
          this.model = null;
        }

        const loader = new LoadM2(this.httpService);
        const mesh = await loader.Start(nextProps.filePath);
        this.model = new M2Model(nextProps.filePath, mesh.m2, mesh.skin);

        this.scene.add(this.model);
      }
    }
  }

  public animate = (time: number) => {
    requestAnimationFrame(this.animate);
    this.renderScene();
  }

  private renderScene = () => {
    const timer = 0.002 * Date.now();
    if (this.model !== null) {
      this.model.rotateY(0.04);
      this.model.updateMatrix();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  public render() {
    return (
      <div style={{width: 800, height: 800}} ref={ (element) => this.threeRootElement = element} />
    );
  }
}
