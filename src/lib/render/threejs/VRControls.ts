import { Matrix4 } from 'three';

export namespace THREE {
  export class VRControls {
    private vrDisplay: VRDisplay|null = null;
    private vrDisplays: any;
    private standingMatrix: Matrix4 = new Matrix4();
    private frameData: any = null;
    private scale: number = 1;
    private standing = false;
    private userHeight = 1.6;

    constructor(private object: any, private onError?: any){
      this.gotVRDisplays = this.gotVRDisplays.bind(this);

      if ('VRFrameData' in window ) {
        this.frameData = new VRFrameData();
      }

      if (navigator.getVRDisplays) {
        navigator.getVRDisplays().then( this.gotVRDisplays ).catch(() => {
          console.warn( 'THREE.VRControls: Unable to get VR Displays' );
        });
      }
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

    public getStandingMatrix() {
      return this.standingMatrix;
    };

    public update() {
      if (this.vrDisplay) {
        let pose;

        if (this.vrDisplay.getFrameData) {
          this.vrDisplay.getFrameData(this.frameData);
          pose = this.frameData.pose;
        }
        else if (this.vrDisplay.getPose) {
          pose = this.vrDisplay.getPose();
        }
  
        if (pose.orientation !== null) {
          this.object.quaternion.fromArray( pose.orientation );
  
        }
  
        if (pose.position !== null) {
          // this.object.position.fromArray( pose.position );
          // this.object.position.set( 0, 0, 0 );
        }
        else {
          this.object.position.set( 0, 0, 0 );
        }
  
        if (this.standing) {
          if (this.vrDisplay && this.vrDisplay.stageParameters) {
            this.object.updateMatrix();
  
            this.standingMatrix.fromArray(this.vrDisplay.stageParameters.sittingToStandingTransform as any);
            this.object.applyMatrix(this.standingMatrix);
          }
          else {
            this.object.position.setY(this.object.position.y + this.userHeight);
          }
        }
  
        this.object.position.multiplyScalar(this.scale);
      }
    };

    public dispose() {
      this.vrDisplay = null;
    };
  }
}
