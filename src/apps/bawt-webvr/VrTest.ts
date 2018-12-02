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
import { PlayerState } from 'bawt/game/PlayerState';
import { BehaviorSubject } from 'rxjs';
import { IVector3 } from 'interface/IVector3';
import { MakeVector3, CopyToVector3 } from 'bawt/utils/Math';
import { equal } from 'assert';
import { Terrain } from 'bawt/game/Terrain';

const boxSize = 5;
const userHeight = 1.6;

const testm2File = `World\\GENERIC\\PASSIVEDOODADS\\Oktoberfest\\PumpkinHead.m2`;

export class VrTest {
  @lazyInject('IHttpService')
  public httpService!: IHttpService;
  
  @lazyInject('PlayerState')
  public player!: PlayerState;

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
  private positionSubject: BehaviorSubject<IVector3> = new BehaviorSubject<IVector3>(MakeVector3(0,0,0));
  private mapSubject: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private terrain: Terrain|null = null;

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
    this.player.map.acquire(this.mapSubject);
    this.player.position.acquire(this.positionSubject);
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
    // [-609 -4211 200] durotar starting area
    const terrainCoords = [-609, -4211, 100];
    const pos = terrainPosToWorld(terrainCoords);
    this.mapSubject.next('kalimdor');

    const worldMap = new WorldMap();
    await worldMap.load(this.mapSubject.value, terrainCoords[0], terrainCoords[1], terrainCoords[2]);
    this.scene.add(worldMap.map);

    this.camera.position.copy(pos);

    this.terrain = new Terrain();
    await this.terrain.initialize();
    this.updateSubjects();

    this.scene.add(this.terrain.root);
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
    CopyToVector3(this.positionSubject.value, this.tmp);
    if (this.camera.position.manhattanDistanceTo(this.tmp) > 0.001) {
      this.positionSubject.next(MakeVector3(this.camera.position.x, this.camera.position.y, this.camera.position.z));
    } 
  }

  private tmp = new Vector3();
  private animate(timestamp: number) {
    this.updateSubjects();

    const delta = Math.min(timestamp - this.lastRenderTime, 500);
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
