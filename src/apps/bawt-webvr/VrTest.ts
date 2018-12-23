import { WebGLRenderer, Scene, PerspectiveCamera, TextureLoader, Texture, Vector3, DirectionalLight,
  RepeatWrapping, BoxGeometry, MeshBasicMaterial, BackSide, Mesh, DirectionalLightHelper } from 'three';
import { THREE } from './VRControls';
import { VREffect } from './VREffect';
import * as webvrui from 'webvr-ui';
import { lazyInject } from 'bawt/Container';
import { IHttpService } from 'interface/IHttpService';
import { terrainPosToWorld } from 'bawt/utils/Functions';
import { Keys } from './Keys';
import { FirstPersonControls } from './MapControls';
import { PlayerState, ILocation } from 'bawt/game/PlayerState';
import { BehaviorSubject } from 'rxjs';
import { IVector3 } from 'interface/IVector3';
import { MakeVector3, CopyToVector3 } from 'bawt/utils/Math';
import { Terrain } from 'bawt/game/Terrain';
import { Step, IStep } from 'bawt/utils/Step';
import { Doodads } from 'bawt/game/Doodads';

const boxSize = 5;
const userHeight = 1.6;

export class VrTest {
  @lazyInject('IHttpService') private httpService!: IHttpService;
  @lazyInject('PlayerState') private player!: PlayerState;
  @lazyInject('Step') private step!: Step;
  @lazyInject('Doodads') private doodads!: Doodads;

  private renderer: WebGLRenderer;
  private scene: Scene;
  private controls: THREE.VRControls;
  private effect: VREffect;
  private camera: PerspectiveCamera;
  private vrDisplay: VRDisplay|null = null;
  private skybox: Mesh|null = null;
  private lastRenderTime: number = 0;
  private vrButton: webvrui.EnterVRButton;
  private keys: Keys = new Keys();
  private fpControls: FirstPersonControls;
  private locationSubject: BehaviorSubject<ILocation> = new BehaviorSubject<ILocation>({
    position: MakeVector3(0, 0, 0),
    map: '',
  });
  private stepSubject: BehaviorSubject<IStep> = new BehaviorSubject<IStep>({
    delta: 0,
    time: 0,
  });
  private terrain: Terrain|null = null;
  private light: DirectionalLight = new DirectionalLight();

  // azeroth
  // [-6176.31, 383.74, 402.13]; outside front entrance, dwarf starting area
  // [-6086.34, 383.87, 397.88]; inside, dward starting area
  // [-9755, 681, 200], westfall
  // [-10509, 1033, 200]
  // [-9278.59, -2215.9, 70.14], redridge
  // [-10800, -442, 200];
  // [-11884, -3223, 200], dark portal
  //
  // kalimdor
  // [-607.75, -4227.6, 40.9] durotar starting area
  // [-823, -4907, 40.9] durotar senjin village
  // [-42, -4936, 30] durotar, skuttel coast
  // [292.9, -3713.6, 35.5] durotar, northern barrens
  // [-454.4, -2649.1, 99.4] durotar, crossroads
  private terrainCoords = [235.2, -4565.5, 19.98];
  private map = 'kalimdor';

  constructor() {
    this.onTextureLoaded = this.onTextureLoaded.bind(this);
    this.onResize = this.onResize.bind(this);
    this.setupStage = this.setupStage.bind(this);
    this.setStageDimensions = this.setStageDimensions.bind(this);
    this.animate = this.animate.bind(this);

    this.renderer = new WebGLRenderer( { antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);

    document.body.appendChild(this.renderer.domElement);

    this.scene = new Scene();
    this.light.position.copy(new Vector3(1, 0.6, 0));
    this.light.intensity = 0.1;

    this.scene.add(this.light);

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new PerspectiveCamera( 75, aspect, 0.1, 10000);
    this.controls = new THREE.VRControls(this.camera);
    this.camera.position.y = userHeight;

    this.fpControls = new FirstPersonControls(this.camera, this.renderer.domElement);
    this.effect = new VREffect(this.renderer);
    this.effect.setSize(window.innerWidth, window.innerHeight, {});

    const loader = new TextureLoader();
    loader.load('src/apps/bawt-webvr/img/box.png', this.onTextureLoaded);

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

    const pos = terrainPosToWorld(this.terrainCoords);
    this.camera.position.copy(pos);
    this.locationSubject.next({
      map: this.map,
      position: new Vector3(pos.x, pos.y, pos.z),
    });

    this.player.location.acquire(this.locationSubject);
    this.step.step.acquire(this.stepSubject);
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

    this.terrain = new Terrain();
    await this.terrain.initialize();
    this.updateSubjects();

    this.scene.add(this.terrain.root);
    this.scene.add(this.doodads.root);
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
  }

  private updateSubjects() {
    // Update position subject if the camera has moved enough.
    CopyToVector3(this.locationSubject.value.position, this.tmp);
    if (this.camera.position.manhattanDistanceTo(this.tmp) > 0.001) {
      this.locationSubject.next({
        map: this.locationSubject.value.map,
        position: MakeVector3(this.camera.position.x, this.camera.position.y, this.camera.position.z),
      });
    }
  }

  private tmp = new Vector3();
  private animate(timestamp: number) {
    const delta = Math.min(timestamp - this.lastRenderTime, 500);
    this.stepSubject.next({
      delta,
      time: 0,
    });
    this.updateSubjects();

    this.fpControls.update(delta);
    this.lastRenderTime = timestamp;
    // Only update controls if we're presenting.
    if (this.vrButton.isPresenting()) {
      this.controls.update();
    }
    // Render the scene.
    this.effect.render(this.scene, this.camera);
    this.vrDisplay!.requestAnimationFrame(this.animate);
  }
}
