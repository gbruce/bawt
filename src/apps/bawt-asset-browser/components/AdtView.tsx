import * as React from 'react';
import * as THREE from 'three';
import { lazyInject } from 'bawt/Container';
import { ADT } from 'bawt/assets/adt/index';
import { M2Model } from 'bawt/assets/m2/index';
import { Chunk } from 'bawt/assets/adt/Chunk';
import { IAssetProvider } from 'interface/IAssetProvider';

interface IProps {
  filePath: string;
}

export class AdtView extends React.Component<IProps, {}> {
  @lazyInject('IAssetProvider<blizzardry.IADT>') private adtProvider!: IAssetProvider<blizzardry.IADT>;

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

  private async loadModel(filePath: string) {
    if (this.camera === null || this.scene === null) {
      return;
    }

    const adt = await this.adtProvider.start(this.props.filePath);
    
    /*
    const mesh = await loader.Start(filePath);
    this.model = new M2Model(filePath, mesh.m2, mesh.skin);
    this.model.updateMatrix();
    const boundingBox = new THREE.Box3();
    const size = new THREE.Vector3();
    boundingBox.setFromObject(this.model);
    boundingBox.getSize(size);

    const maxDimension = Math.max(size.x, size.y, size.z);
    this.camera.position.x = maxDimension;
    this.camera.position.y = maxDimension;
    this.camera.position.z = maxDimension;

    this.scene.add(this.model);
    */
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

    await this.loadModel(this.props.filePath);
  }

  public async componentWillUpdate?(nextProps: IProps, nextState: {}, nextContext: any) {
    if (nextProps.filePath !== this.props.filePath) {
      if (this.renderer !== null && this.scene !== null && this.camera !== null) {
        if (this.model !== null) {
          this.scene.remove(this.model);
          this.model.dispose();
          this.model = null;
        }

        await this.loadModel(nextProps.filePath);
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
