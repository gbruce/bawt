import * as React from 'react';
import { lazyInject } from 'bawt/Container';
import * as THREE from 'three';
import { LoadM2 } from 'bawt/worker/LoadM2';
import { IHttpService } from 'interface/IHttpService';
import { M2Model } from 'bawt/assets/m2/index';

// test webgl scene
export class GameView extends React.Component<{}, {}> {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();
  private scene: THREE.Scene = new THREE.Scene();
  private camera: THREE.Camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  private box: THREE.Mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
    color: 0xaaaaaa,
    wireframe: true,
  }));

  public async componentDidMount() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    const axis = new THREE.AxesHelper(10);
    this.scene.add(axis);
    const light = new THREE.DirectionalLight(0xffffff, 1.0);
    light.position.set(100, 100, 100);
    this.scene.add(light);
    const light2 = new THREE.DirectionalLight(0xffffff, 1.0);

    light2.position.set(-100, 100, -100);
    this.scene.add(light2);

    // create a box and add it to the scene
    this.scene.add(this.box);

    this.box.position.x = 0.5;
    this.box.rotation.y = 0.5;

    this.camera.position.x = 20;
    this.camera.position.y = 20;
    this.camera.position.z = 20;

    this.camera.lookAt(this.scene.position);

    this.animate(0);

    const path = 'WORLD\\AZEROTH\\DUSKWOOD\\PASSIVEDOODADS\\DUSKWOODSTRAW\\DUSKWOODSTRAW.M2';
    const loader = new LoadM2(this.httpService);
    const mesh = await loader.Start(path);
    const m2 = new M2Model(path, mesh.m2, mesh.skin);

    this.scene.add(m2);
  }

  public animate = (time: number) => {
    requestAnimationFrame(this.animate);
    this.renderScene();
  }

  private renderScene = () => {
    const timer = 0.002 * Date.now();
    this.box.position.y = 0.5 + 0.5 * Math.sin(timer);
    this.box.rotation.x += 0.1;
    this.renderer.render(this.scene, this.camera);
  }

  public render() {
    return (null);
  }
}
