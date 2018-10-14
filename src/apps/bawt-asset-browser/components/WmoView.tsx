import * as React from 'react';
import * as THREE from 'three';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { WMOGroup } from 'bawt/assets/wmo/group/WMOGroup';
import { LoadWMO } from 'bawt/worker/LoadWMO';
import { LoadWMOGroup } from 'bawt/worker/LoadWMOGroup';
import { WMO } from 'bawt/assets/wmo/index';
import { Vector3 } from 'three';

interface IProps {
  filePath: string;
}

export class WmoView extends React.Component<IProps, {}> {

  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private threeRootElement: any;

  constructor(props: IProps) {
    super(props);
  }

  private renderer: THREE.WebGLRenderer|null = null;
  private scene: THREE.Scene|null = null;
  private camera: THREE.PerspectiveCamera|null = null;
  private wmoGroup: WMOGroup|null = null;
  private wmo: WMO|null = null;

  private maybeReleaseRenderer() {
    this.camera = null;
    this.scene = null;

    if (this.wmoGroup !== null) {
      this.wmoGroup!.dispose();
      this.wmoGroup = null;
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

    const regex = /.+_\d{3}/i;
    const result = filePath.match(regex);

    // const regex = new RegExp('.+_\d{3}');
    if (result && result.length > 0) {
      const wmoRootFile = filePath.substring(0, filePath.length - 8) + '.wmo';
      const wmoRootLoader = new LoadWMO(this.httpService);
      const wmoRoot = await wmoRootLoader.Start(wmoRootFile);
      const wmoGroupLoader = new LoadWMOGroup(this.httpService);
      const wmoGroup = await wmoGroupLoader.Start(this.props.filePath);
      if (wmoRoot) {
        this.wmoGroup = new WMOGroup(wmoRoot, '', wmoGroup, filePath);
        this.wmoGroup.updateMatrix();
      }
    }
    else {
      const wmoLoader = new LoadWMO(this.httpService);
      const wmo = await wmoLoader.Start(this.props.filePath);
      if (wmo) {
        this.wmo = new WMO(filePath, wmo);
      }
    }

    if (this.wmoGroup) {
      const boundingBox = new THREE.Box3();
      const size = new THREE.Vector3();
      const center = new THREE.Vector3();
      boundingBox.setFromObject(this.wmoGroup);
      boundingBox.getSize(size);
      boundingBox.getCenter(center);

      this.scene.add(this.wmoGroup);

      this.setupCamera();
    }
  }

  private setupCamera() {
    if (this.wmoGroup && this.camera) {
      const boundingBox = new THREE.Box3();

      // get bounding box of object - this will be used to setup controls and camera
      boundingBox.setFromObject(this.wmoGroup);

      const center = new Vector3();
      boundingBox.getCenter(center);

      const size = new Vector3();
      boundingBox.getSize(size);

      // get the max side of the bounding box (fits to width OR height as needed )
      const maxDim = Math.max( size.x, size.y, size.z );
      const fov = this.camera.fov * ( Math.PI / 180 );
      let cameraZ = Math.abs( maxDim / 4 * Math.tan( fov * 2 ) );

      cameraZ *= 1.25; // zoom out a little so that objects don't fill the screen

      this.camera.position.set(center.x, center.y, center.z);
      this.camera.position.z = cameraZ;

      const minZ = boundingBox.min.z;
      const cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;

      this.camera.far = cameraToFarEdge * 3;
      this.camera.updateProjectionMatrix();
      this.camera.lookAt(center);
    }
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

    // this.camera.position.x = 2;
    // this.camera.position.y = 2;
    // this.camera.position.z = 2;

    // this.camera.lookAt(this.scene.position);
    this.setupCamera();

    this.animate(0);

    await this.loadModel(this.props.filePath);
  }

  public async componentWillUpdate?(nextProps: IProps, nextState: {}, nextContext: any) {
    if (nextProps.filePath !== this.props.filePath) {
      if (this.renderer !== null && this.scene !== null && this.camera !== null) {
        if (this.wmoGroup !== null) {
          this.scene.remove(this.wmoGroup);
          this.wmoGroup.dispose();
          this.wmoGroup = null;
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
    if (this.wmoGroup !== null) {
      // this.wmoGroup.rotateY(0.04);
      // this.wmoGroup.updateMatrix();
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
