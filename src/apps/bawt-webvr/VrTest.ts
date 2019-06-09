import { WebGLRenderer, TextureLoader, Texture, Vector3, RepeatWrapping, Mesh } from 'three';
import * as webvrui from 'webvr-ui';
import { terrainPosToWorld } from 'bawt/utils/Functions';
import { Keys } from './Keys';
import { FirstPersonControls } from './MapControls';
import { BehaviorSubject } from 'rxjs';
import { MakeVector3, CopyToVector3 } from 'bawt/utils/Math';
import { Terrain, TerrainFactory } from 'bawt/game/Terrain';
import { Step, IStep } from 'bawt/utils/Step';
import { DoodadVisibility, DoodadVisibilityFactory } from 'bawt/game/DoodadVisibility';
import { inject, injectable } from 'inversify';
import { VrHud } from './VrHud';
import { MapFactory, Map } from 'bawt/game/Map';
import { IVector3 } from 'interface/IVector3';
import { RenderEngineFactory, IRenderEngine, ICamera } from 'interface/IRenderEngine';

const boxSize = 5;
const userHeight = 1.6;

@injectable()
export class VrTest {
  private renderer: WebGLRenderer;
  private camera: ICamera;
  private vrDisplay: VRDisplay|null = null;
  private skybox: Mesh|null = null;
  private lastRenderTime: number = 0;
  private vrButton: webvrui.EnterVRButton;
  private keys: Keys = new Keys();
  private fpControls: FirstPersonControls;
  private locationSubject: BehaviorSubject<IVector3> = new BehaviorSubject<IVector3>(MakeVector3(0, 0, 0));
  private stepSubject: BehaviorSubject<IStep> = new BehaviorSubject<IStep>({
    delta: 0,
    time: 0,
  });
  private terrain: Terrain|null = null;
  private vrHud: VrHud;

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
  private theMap: Map|null = null;
  private doodadVis: DoodadVisibility|null = null;
  private renderEngine: IRenderEngine;

  constructor(
    @inject('MapFactory') private mapFactory: MapFactory,
    @inject('Step') private step: Step,
    @inject('DoodadVisibilityFactory') private doodadVisFactory: DoodadVisibilityFactory,
    @inject('TerrainFactory') private terrainFactory: TerrainFactory,
    @inject('RenderEngineFactory') renderEngineFactory: RenderEngineFactory,
  ) {
    const canvas = document.getElementById('renderCanvas') as HTMLCanvasElement;

    this.onTextureLoaded = this.onTextureLoaded.bind(this);
    this.setupStage = this.setupStage.bind(this);
    this.setStageDimensions = this.setStageDimensions.bind(this);
    this.animate = this.animate.bind(this);

    this.renderEngine = renderEngineFactory();
    this.camera = this.renderEngine.mainCamera;
    this.renderer = this.renderEngine.mainRenderer;

    this.renderEngine.addLight({
      position: {x: 1, y: 0.6, z: 0},
      intensity: 0.1,
    });

    this.camera.setPosition({y: userHeight});

    this.fpControls = new FirstPersonControls(this.camera.nativeCamera, canvas);

    const loader = new TextureLoader();
    loader.load('src/apps/bawt-webvr/img/box.png', this.onTextureLoaded);

    const uiOptions = {
      color: 'black',
      background: 'white',
      corners: 'square',
    };
    this.vrButton = new webvrui.EnterVRButton(canvas, uiOptions);
    this.vrButton.on('exit', () => {
      this.camera.setRotation({ x: 0, y: 0, z: 0, w: 1});
      this.camera.setPosition({ x: 0, y: userHeight, z: 0});
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
    this.camera.setPosition(pos);
    this.locationSubject.next(new Vector3(pos.x, pos.y, pos.z));

    this.step.step.acquire(this.stepSubject);

    this.vrHud = new VrHud(this.renderer);
    this.camera.nativeCamera.add(this.vrHud.mesh);
  }

  private onTextureLoaded(texture: Texture): void {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(boxSize, boxSize);
    // const geometry = new BoxGeometry(boxSize, boxSize, boxSize);
    // const material = new MeshBasicMaterial({
    //   map: texture,
    //   color: 0x01BE00,
    //   side: BackSide,
    // });
    // // Align the skybox to the floor (which is at y=0).
    // this.skybox = new Mesh(geometry, material);
    // this.skybox.position.y = boxSize / 2;
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

    this.theMap = await this.mapFactory('kalimdor');
    await this.theMap.initialize();

    this.terrain = await this.terrainFactory(this.theMap.adts);
    await this.terrain.initialize();

    this.doodadVis = await this.doodadVisFactory(this.theMap.doodads.doodadSubject, this.theMap.position.observable);
    await this.doodadVis.initialize();

    this.theMap.position.acquire(this.locationSubject);
    this.updateSubjects();
    this.renderEngine.addObject(this.terrain.root);
    this.renderEngine.addObject(this.doodadVis.root);
  }

  private setStageDimensions(stage: VRStageParameters) {
    // Make the skybox fit the stage.
    // const material = this.skybox!.material;
    // this.scene.remove(this.skybox!);
    // Size the skybox according to the size of the actual stage.
    // const geometry = new BoxGeometry(stage.sizeX!, boxSize, stage.sizeY!);
    // this.skybox = new Mesh(geometry, material);
    // Place it on the floor.
    // this.skybox.position.y = boxSize / 2;
    // this.scene.add(this.skybox);
  }

  private updateSubjects() {
    // Update position subject if the camera has moved enough.
    CopyToVector3(this.locationSubject.value, this.tmp);
    if (this.camera.nativeCamera.position.manhattanDistanceTo(this.tmp) > 0.001) {
      this.locationSubject.next(MakeVector3(this.camera.position.x, this.camera.position.y, this.camera.position.z));
    }
  }

  private tmp = new Vector3();
  private animate(timestamp: number) {
    const startTime = performance.now();
    const delta = Math.min(timestamp - this.lastRenderTime, 500);
    this.stepSubject.next({
      delta,
      time: 0,
    });
    this.updateSubjects();

    this.lastRenderTime = timestamp;
    // Only update controls if we're presenting.
    if (this.vrButton.isPresenting()) {
      this.renderEngine.updateControls();
    }
    // Render the scene.
    this.renderEngine.render();
    this.vrDisplay!.requestAnimationFrame(this.animate);

    this.vrHud.update(timestamp, performance.now() - startTime);
    this.fpControls.update(delta);
  }
}
