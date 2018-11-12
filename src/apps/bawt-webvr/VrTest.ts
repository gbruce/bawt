import { WebGLRenderer, Scene, PerspectiveCamera, TextureLoader, Texture, Vector3, DirectionalLight,
  RepeatWrapping, BoxGeometry, MeshBasicMaterial, BackSide, Mesh, MeshNormalMaterial, Box3, BoxHelper, Color } from 'three';
import { THREE } from './VRControls';
import { VREffect } from './VREffect';
import * as webvrui from 'webvr-ui';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { LoadWMO } from 'bawt/worker/LoadWMO';
import { LoadWMOGroup } from 'bawt/worker/LoadWMOGroup';
import { WMO } from 'bawt/assets/wmo/index';
import { WMOGroup } from 'bawt/assets/wmo/group/WMOGroup';
import { LoadWDT } from 'bawt/worker/LoadWDT';
import { Chunk } from 'bawt/assets/adt/Chunk';
import { terrainPosToWorld }  from 'bawt/utils/Functions';
import { WorldMap } from 'bawt/game/WorldMap';
import { Keys } from './Keys';
import { FirstPersonControls } from './MapControls';

const boxSize = 5;
const userHeight = 1.6;

const testm2File = `World\\GENERIC\\PASSIVEDOODADS\\Oktoberfest\\PumpkinHead.m2`;

export class VrTest {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;

  private renderer: WebGLRenderer;
  private scene: Scene;
  private controls: THREE.VRControls;
  private effect: VREffect;
  private camera: PerspectiveCamera;
  private vrDisplay: VRDisplay|null = null;
  private skybox: Mesh|null = null;
  private cube: Mesh;
  private lastRenderTime: number = 0;
  private vrButton: webvrui.EnterVRButton;
  private keys: Keys = new Keys();
  private fpControls: FirstPersonControls;

  constructor() {
    this.onTextureLoaded = this.onTextureLoaded.bind(this);
    this.onResize = this.onResize.bind(this);
    this.setupStage = this.setupStage.bind(this);
    this.setStageDimensions = this.setStageDimensions.bind(this);
    this.animate = this.animate.bind(this);

    this.renderer = new WebGLRenderer( { antialias: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera( 75, aspect, 0.1, 10000);
    this.controls = new THREE.VRControls(this.camera);
    this.camera.position.y = userHeight;

    this.fpControls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.effect = new VREffect(this.renderer);
    this.effect.setSize(window.innerWidth, window.innerHeight, {});

    const loader = new TextureLoader();
    loader.load('src/apps/bawt-webvr/img/box.png', this.onTextureLoaded);

    const geometry = new BoxGeometry(0.5, 0.5, 0.5);
    const material = new MeshNormalMaterial();
    this.cube = new Mesh(geometry, material);

    this.cube.position.set(0, userHeight, -1);

    this.scene.add(this.cube);

    window.addEventListener('resize', this.onResize, true);
    window.addEventListener('vrdisplaypresentchange', this.onResize, true);

    const uiOptions = {
      color: 'black',
      background: 'white',
      corners: 'square',
    };
    this.vrButton = new webvrui.EnterVRButton(this.renderer.domElement, uiOptions);
    this.vrButton.on('exit', () => {
      this.camera.quaternion.set(0, 0, 0, 1);
      this.camera.position.set(0, userHeight, 0);
    });
    this.vrButton.on('hide', () => {
      document.getElementById('ui')!.style.display = 'none';
    });
    this.vrButton.on('show', () => {
      document.getElementById('ui')!.style.display = 'inherit';
    });
    document.getElementById('vr-button')!.appendChild(this.vrButton.domElement);
    document.getElementById('magic-window')!.addEventListener('click', () => {
      this.vrButton.requestEnterFullscreen();
    });
  }

  private onResize() {
    this.effect.setSize(window.innerWidth, window.innerHeight, {});
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  private onTextureLoaded(texture: Texture): void {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(boxSize, boxSize);
    const geometry = new BoxGeometry(boxSize, boxSize, boxSize);
    const material = new MeshBasicMaterial({
      map: texture,
      color: 0x01BE00,
      side: BackSide,
    });
    // Align the skybox to the floor (which is at y=0).
    this.skybox = new Mesh(geometry, material);
    this.skybox.position.y = boxSize / 2;
    // this.scene.add(this.skybox);

    this.setupStage();
  }

  private async setupStage() {
    navigator.getVRDisplays().then((displays: VRDisplay[]) => {
      if (displays.length > 0) {
        this.vrDisplay = displays[0];
        if (this.vrDisplay.stageParameters) {
          this.setStageDimensions(this.vrDisplay.stageParameters);
        }
        this.vrDisplay.requestAnimationFrame(this.animate);
      }
    });

    const terrainCoords = [258, -4700, 25.2];
    const pos = terrainPosToWorld(terrainCoords);
    // this.player.worldport(0, -14354, 518, 22);
    const worldMap = new WorldMap();
    await worldMap.load(`kalimdor`, terrainCoords[0], terrainCoords[1]);
    this.scene.add(worldMap.map);

    this.camera.position.copy(pos);
  }

  private setStageDimensions(stage: VRStageParameters) {
    // Make the skybox fit the stage.
    const material = this.skybox!.material;
    this.scene.remove(this.skybox!);
    // Size the skybox according to the size of the actual stage.
    const geometry = new BoxGeometry(stage.sizeX!, boxSize, stage.sizeY!);
    this.skybox = new Mesh(geometry, material);
    // Place it on the floor.
    this.skybox.position.y = boxSize / 2;
    // this.scene.add(this.skybox);
    // Place the cube in the middle of the scene, at user height.
    this.cube.position.set(0, userHeight, 0);
  }

  private animate(timestamp: number) {
    if (this.keys.pressed('W')) {

    }

    const delta = Math.min(timestamp - this.lastRenderTime, 500);
    this.fpControls.update(delta);
    this.lastRenderTime = timestamp;
    // Apply rotation to cube mesh
    this.cube.rotation.y += delta * 0.0006;
    // Only update controls if we're presenting.
    if (this.vrButton.isPresenting()) {
      this.controls.update();
    }
    // Render the scene.
    this.effect.render(this.scene, this.camera);
    this.vrDisplay!.requestAnimationFrame(this.animate);
  }
}
