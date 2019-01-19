import * as React from 'react';
import * as THREE from 'three';
import { lazyInject } from 'bawt/Container';
import { IAssetProvider } from 'interface/IAssetProvider';
import { ISceneObject } from 'interface/ISceneObject';

interface IProps {
  filePath: string;
}

export class M2View extends React.Component<IProps, {}> {
  @lazyInject('IAssetProvider<blizzardry.IModel>')
  public modelProvider!: IAssetProvider<ISceneObject>;

  private threeRootElement: any;

  constructor(props: IProps) {
    super(props);
  }

  private renderer: THREE.WebGLRenderer|null = null;
  private scene: THREE.Scene|null = null;
  private camera: THREE.Camera|null = null;
  private model: ISceneObject|null = null;

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

    this.model = await this.modelProvider.start(filePath);
    this.model.object3d.updateMatrix();
    const boundingBox = new THREE.Box3();
    const size = new THREE.Vector3();
    boundingBox.setFromObject(this.model.object3d);
    boundingBox.getSize(size);

    const maxDimension = Math.max(size.x, size.y, size.z);
    this.camera.position.x = maxDimension;
    this.camera.position.y = maxDimension;
    this.camera.position.z = maxDimension;

    this.scene.add(this.model.object3d);
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
          this.scene.remove(this.model.object3d);
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
      this.model.object3d.rotateY(0.04);
      this.model.object3d.updateMatrix();
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
