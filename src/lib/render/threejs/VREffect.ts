
import { Vector3, Matrix4, PerspectiveCamera, Quaternion } from 'three';

export class VREffect {
  private vrDisplay: VRDisplay|null = null;
  private vrDisplays: any;
  private eyeTranslationL = new Vector3();
  private eyeTranslationR = new Vector3();
  private renderRectL: any;
  private renderRectR: any;
  private headMatrix = new Matrix4();
  private eyeMatrixL = new Matrix4();
  private eyeMatrixR = new Matrix4();
  private frameData: any = null;
  private isPresenting: boolean = false;
  private rendererSize: any;
  private rendererUpdateStyle = false;
  private rendererPixelRatio: number;
  private canvas: any;
  private defaultLeftBounds: any;
  private defaultRightBounds: any;
  private autoSubmitFrame: boolean = true;
  private cameraL: PerspectiveCamera;
  private cameraR: PerspectiveCamera;
  private poseOrientation = new Quaternion();
  private posePosition = new Vector3();

  constructor(private renderer: any, private onError?: any) {
    this.onVRDisplayPresentChange = this.onVRDisplayPresentChange.bind(this);
    this.gotVRDisplays = this.gotVRDisplays.bind(this);

    if ('VRFrameData' in window) {
      this.frameData = new VRFrameData();
    }

    if (navigator.getVRDisplays) {
      navigator.getVRDisplays().then( this.gotVRDisplays ).catch(() => {
        console.warn( 'THREE.VREffect: Unable to get VR Displays' );
      });
    }

    this.rendererSize = renderer.getSize();
    this.rendererUpdateStyle = false;
    this.rendererPixelRatio = renderer.getPixelRatio();

    this.canvas = renderer.domElement;
    this.defaultLeftBounds = [ 0.0, 0.0, 0.5, 1.0 ];
    this.defaultRightBounds = [ 0.5, 0.0, 0.5, 1.0 ];

    window.addEventListener('vrdisplaypresentchange', this.onVRDisplayPresentChange, false);
    window.addEventListener('resize', this.onSizeChanged, true);

    this.cameraL = new PerspectiveCamera();
    this.cameraL.layers.enable(1);

    this.cameraR = new PerspectiveCamera();
    this.cameraR.layers.enable(2);

    this.setSize(window.innerWidth, window.innerHeight, {});
  }

  public gotVRDisplays(displays: any) {
    this.vrDisplays = displays;
    if (displays.length > 0) {
      this.vrDisplay = displays[ 0 ];
    }
    else {
      if (this.onError) {
        this.onError( 'VR input not available.' );
      }
    }
  }

  public getVRDisplay() {
    return this.vrDisplay;
  };

  public setVRDisplay(value: any ) {
    this.vrDisplay = value;
  };

  public getVRDisplays() {
    console.warn( 'THREE.VREffect: getVRDisplays() is being deprecated.' );
    return this.vrDisplays;
  };

  private onSizeChanged() {
    this.setSize(window.innerWidth, window.innerHeight, {});
  }

  public setSize(width: number, height: number, updateStyle: any) {
    this.rendererSize = { width: width, height: height };
    this.rendererUpdateStyle = updateStyle;

    if (this.isPresenting) {
      var eyeParamsL = this.vrDisplay!.getEyeParameters('left');
      this.renderer.setPixelRatio(1);
      this.renderer.setSize(eyeParamsL.renderWidth * 2, eyeParamsL.renderHeight, false);
    }
    else {
      this.renderer.setPixelRatio( this.rendererPixelRatio );
      this.renderer.setSize( width, height, updateStyle );
    }
  }

  public onVRDisplayPresentChange() {
    const wasPresenting = this.isPresenting;
    this.isPresenting = this.vrDisplay !== undefined && this.vrDisplay!.isPresenting;

    if (this.isPresenting) {
      var eyeParamsL = this.vrDisplay!.getEyeParameters('left');
      var eyeWidth = eyeParamsL.renderWidth;
      var eyeHeight = eyeParamsL.renderHeight;

      if (!wasPresenting) {
        this.rendererPixelRatio = this.renderer.getPixelRatio();
        this.rendererSize = this.renderer.getSize();

        this.renderer.setPixelRatio( 1 );
        this.renderer.setSize(eyeWidth * 2, eyeHeight, false);
      }
    }
    else if (wasPresenting) {
      this.renderer.setPixelRatio(this.rendererPixelRatio);
      this.renderer.setSize(this.rendererSize.width, this.rendererSize.height, this.rendererUpdateStyle);
    }
  }

  public setFullScreen(fullscreen: boolean) {
    const that = this;
    return new Promise( function (resolve: any, reject: any) {
      if (that.vrDisplay === undefined) {
        reject(new Error( 'No VR hardware found.'));
        return;
      }

      if (that.isPresenting === fullscreen) {
        resolve();
        return;
      }

      if (fullscreen) {
        resolve(that.vrDisplay!.requestPresent( [ { source: that.canvas } ] ));
      }
      else {
        resolve(that.vrDisplay!.exitPresent());
      }
    });
  }

  public requestPresent() {
    return this.setFullScreen(true);
  }

  public exitPresent() {
    return this.setFullScreen(false);
  }

  public requestAnimationFrame(f: any) {
    if (this.vrDisplay !== undefined) {
      return this.vrDisplay!.requestAnimationFrame(f);
    }
    else {
      return window.requestAnimationFrame(f);
    }
  }

  public cancelAnimationFrame(h: any) {
    if (this.vrDisplay !== undefined) {
      this.vrDisplay!.cancelAnimationFrame(h);
    }
    else {
      window.cancelAnimationFrame(h);
    }
  }

  public submitFrame() {
    if (this.vrDisplay !== undefined && this.isPresenting) {
      this.vrDisplay!.submitFrame();
    }
  }

  public render(scene: any, camera: any, renderTarget?: any, forceClear?: any) {
    if (this.vrDisplay && this.isPresenting) {
      var autoUpdate = scene.autoUpdate;

      if (autoUpdate) {
        scene.updateMatrixWorld();
        scene.autoUpdate = false;
      }

      if (Array.isArray(scene)) {
        console.warn( 'THREE.VREffect.render() no longer supports arrays. Use object.layers instead.' );
        scene = scene[ 0 ];
      }

      // When rendering we don't care what the recommended size is, only what the actual size
      // of the backbuffer is.
      var size = this.renderer.getSize();
      var layers = this.vrDisplay.getLayers();
      var leftBounds;
      var rightBounds;

      if (layers.length) {
        var layer: any = layers[0];

        leftBounds = layer.leftBounds !== null && layer.leftBounds.length === 4 ? layer.leftBounds : this.defaultLeftBounds;
        rightBounds = layer.rightBounds !== null && layer.rightBounds.length === 4 ? layer.rightBounds : this.defaultRightBounds;
      }
      else {
        leftBounds = this.defaultLeftBounds;
        rightBounds = this.defaultRightBounds;
      }

      this.renderRectL = {
        x: Math.round( size.width * leftBounds[ 0 ] ),
        y: Math.round( size.height * leftBounds[ 1 ] ),
        width: Math.round( size.width * leftBounds[ 2 ] ),
        height: Math.round( size.height * leftBounds[ 3 ] )
      };

      this.renderRectR = {
        x: Math.round( size.width * rightBounds[ 0 ] ),
        y: Math.round( size.height * rightBounds[ 1 ] ),
        width: Math.round( size.width * rightBounds[ 2 ] ),
        height: Math.round( size.height * rightBounds[ 3 ] )
      };

      if (renderTarget) {
        this.renderer.setRenderTarget( renderTarget );
        renderTarget.scissorTest = true;
      }
      else {
        this.renderer.setRenderTarget( null );
        this.renderer.setScissorTest( true );
      }

      if (this.renderer.autoClear || forceClear) {
        this.renderer.clear();
      }

      if (camera.parent === null) {
        camera.updateMatrixWorld();
      }

      camera.matrixWorld.decompose(this.cameraL.position, this.cameraL.quaternion, this.cameraL.scale);

      this.cameraR.position.copy(this.cameraL.position);
      this.cameraR.quaternion.copy(this.cameraL.quaternion);
      this.cameraR.scale.copy(this.cameraL.scale);

      if (this.vrDisplay.getFrameData) {
        this.vrDisplay.depthNear = camera.near;
        this.vrDisplay.depthFar = camera.far;

        this.vrDisplay.getFrameData(this.frameData);

        this.cameraR.projectionMatrix.elements = this.frameData.rightProjectionMatrix;
        this.cameraL.projectionMatrix.elements = this.frameData.leftProjectionMatrix;

        this.getEyeMatrices(this.frameData);

        this.cameraL.updateMatrix();
        this.cameraL.matrix.multiply(this.eyeMatrixL);
        this.cameraL.matrix.decompose(this.cameraL.position, this.cameraL.quaternion, this.cameraL.scale );

        this.cameraR.updateMatrix();
        this.cameraR.matrix.multiply(this.eyeMatrixR);
        this.cameraR.matrix.decompose(this.cameraR.position, this.cameraR.quaternion, this.cameraR.scale);
      }
      else {
        var eyeParamsL: any = this.vrDisplay.getEyeParameters( 'left' );
        var eyeParamsR: any = this.vrDisplay.getEyeParameters( 'right' );

        this.cameraL.projectionMatrix = this.fovToProjection(eyeParamsL.fieldOfView, true, camera.near, camera.far);
        this.cameraR.projectionMatrix = this.fovToProjection(eyeParamsR.fieldOfView, true, camera.near, camera.far);

        this.eyeTranslationL.fromArray(eyeParamsL.offset);
        this.eyeTranslationR.fromArray(eyeParamsR.offset);

        this.cameraL.translateOnAxis(this.eyeTranslationL, this.cameraL.scale.x);
        this.cameraR.translateOnAxis(this.eyeTranslationR, this.cameraR.scale.x);
      }

      // render left eye
      if (renderTarget) {
        renderTarget.viewport.set(this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height);
        renderTarget.scissor.set(this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height);
      }
      else {
        this.renderer.setViewport(this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height);
        this.renderer.setScissor(this.renderRectL.x, this.renderRectL.y, this.renderRectL.width, this.renderRectL.height);
      }
      this.renderer.render(scene, this.cameraL, renderTarget, forceClear);

      // render right eye
      if (renderTarget) {
        renderTarget.viewport.set(this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height);
        renderTarget.scissor.set(this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.heightß);
      }
      else {
        this.renderer.setViewport(this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height);
        this.renderer.setScissor(this.renderRectR.x, this.renderRectR.y, this.renderRectR.width, this.renderRectR.height);
      }
      this.renderer.render(scene, this.cameraR, renderTarget, forceClear);

      if (renderTarget) {
        renderTarget.viewport.set( 0, 0, size.width, size.height );
        renderTarget.scissor.set( 0, 0, size.width, size.height );
        renderTarget.scissorTest = false;
        this.renderer.setRenderTarget(null);
      }
      else {
        this.renderer.setViewport(0, 0, size.width, size.height);
        this.renderer.setScissorTest(false);
      }

      if (autoUpdate) {
        scene.autoUpdate = true;
      }

      if (this.autoSubmitFrame) {
        this.submitFrame();
      }

      return;
    }

    // Regular render mode if not HMD
    this.renderer.render(scene, camera, renderTarget, forceClear);
  }
  
  public dispose() {
    window.removeEventListener('vrdisplaypresentchange', this.onVRDisplayPresentChange, false);
  }
  
  // Compute model matrices of the eyes with respect to the head.
  public getEyeMatrices(frameData: any) {
    // Compute the matrix for the position of the head based on the pose
    if (frameData.pose.orientation) {
      this.poseOrientation.fromArray(frameData.pose.orientation);
      this.headMatrix.makeRotationFromQuaternion(this.poseOrientation);
    }
    else {
      this.headMatrix.identity();
    }

    if (frameData.pose.position) {
      this.posePosition.fromArray(frameData.pose.position);
      this.headMatrix.setPosition(this.posePosition);
    }

    // The view matrix transforms vertices from sitting space to eye space. As such, the view matrix can be thought of as a product of two matrices:
    // headToEyeMatrix * sittingToHeadMatrix

    // The headMatrix that we've calculated above is the model matrix of the head in sitting space, which is the inverse of sittingToHeadMatrix.
    // So when we multiply the view matrix with headMatrix, we're left with headToEyeMatrix:
    // viewMatrix * headMatrix = headToEyeMatrix * sittingToHeadMatrix * headMatrix = headToEyeMatrix
    this.eyeMatrixL.fromArray(frameData.leftViewMatrix);
    this.eyeMatrixL.multiply(this.headMatrix);
    this.eyeMatrixR.fromArray(frameData.rightViewMatrix);
    this.eyeMatrixR.multiply(this.headMatrix);

    // The eye's model matrix in head space is the inverse of headToEyeMatrix we calculated above.
    this.eyeMatrixL.getInverse(this.eyeMatrixL);
    this.eyeMatrixR.getInverse(this.eyeMatrixR);
  }

  public fovToNDCScaleOffset(fov: any) {
    var pxscale = 2.0 / ( fov.leftTan + fov.rightTan );
    var pxoffset = ( fov.leftTan - fov.rightTan ) * pxscale * 0.5;
    var pyscale = 2.0 / ( fov.upTan + fov.downTan );
    var pyoffset = ( fov.upTan - fov.downTan ) * pyscale * 0.5;
    return { scale: [ pxscale, pyscale ], offset: [ pxoffset, pyoffset ] };
  }

  public fovPortToProjection(fov: any, rightHanded: any, zNear: any, zFar: any) {
    rightHanded = rightHanded === undefined ? true : rightHanded;
    zNear = zNear === undefined ? 0.01 : zNear;
    zFar = zFar === undefined ? 10000.0 : zFar;

    var handednessScale = rightHanded ? - 1.0 : 1.0;

    // start with an identity matrix
    var mobj = new Matrix4();
    var m = mobj.elements;

    // and with scale/offset info for normalized device coords
    var scaleAndOffset = this.fovToNDCScaleOffset(fov);

    // X result, map clip edges to [-w,+w]
    m[ 0 * 4 + 0 ] = scaleAndOffset.scale[ 0 ];
    m[ 0 * 4 + 1 ] = 0.0;
    m[ 0 * 4 + 2 ] = scaleAndOffset.offset[ 0 ] * handednessScale;
    m[ 0 * 4 + 3 ] = 0.0;

    // Y result, map clip edges to [-w,+w]
    // Y offset is negated because this proj matrix transforms from world coords with Y=up,
    // but the NDC scaling has Y=down (thanks D3D?)
    m[ 1 * 4 + 0 ] = 0.0;
    m[ 1 * 4 + 1 ] = scaleAndOffset.scale[ 1 ];
    m[ 1 * 4 + 2 ] = - scaleAndOffset.offset[ 1 ] * handednessScale;
    m[ 1 * 4 + 3 ] = 0.0;

    // Z result (up to the app)
    m[ 2 * 4 + 0 ] = 0.0;
    m[ 2 * 4 + 1 ] = 0.0;
    m[ 2 * 4 + 2 ] = zFar / ( zNear - zFar ) * - handednessScale;
    m[ 2 * 4 + 3 ] = ( zFar * zNear ) / ( zNear - zFar );

    // W result (= Z in)
    m[ 3 * 4 + 0 ] = 0.0;
    m[ 3 * 4 + 1 ] = 0.0;
    m[ 3 * 4 + 2 ] = handednessScale;
    m[ 3 * 4 + 3 ] = 0.0;

    mobj.transpose();
    return mobj;
  }

  public fovToProjection(fov: any, rightHanded: any, zNear: any, zFar: any) {
    var DEG2RAD = Math.PI / 180.0;

    var fovPort = {
      upTan: Math.tan( fov.upDegrees * DEG2RAD ),
      downTan: Math.tan( fov.downDegrees * DEG2RAD ),
      leftTan: Math.tan( fov.leftDegrees * DEG2RAD ),
      rightTan: Math.tan( fov.rightDegrees * DEG2RAD )
    };

    return this.fovPortToProjection(fovPort, rightHanded, zNear, zFar);
  }
}
