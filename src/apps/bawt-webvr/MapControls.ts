import { Vector3, Math } from 'three';

export class FirstPersonControls {
  private target = new Vector3( 0, 0, 0 );
  private enabled = true;
  private movementSpeed = 1.0;
  private lookSpeed = 0.005;
  private lookVertical = true;
  private autoForward = false;
  private activeLook = true;
  private heightSpeed = false;
  private heightCoef = 1.0;
  private heightMin = 0.0;
  private heightMax = 1.0;
  private constrainVertical = false;
  private verticalMin = 0;
  private verticalMax = global.Math.PI;
  private autoSpeedFactor = 0.0;
  private mouseX = 0;
  private mouseY = 0;
  private lat = 0;
  private lon = 0;
  private phi = 0;
  private theta = 0;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private mouseDragOn = false;
  private viewHalfX = 0;
  private viewHalfY = 0;
  private moveUp = false;
  private moveDown = false;
  private turnLeft = false;
  private turnRight = false;

  constructor(private object: any, private domElement: any) {
    if ( this.domElement !== document ) {
      this.domElement.setAttribute( 'tabindex', - 1 );
    }

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);

	  this.domElement.addEventListener( 'contextmenu', this.contextmenu, false );
	  this.domElement.addEventListener( 'mousemove', this.onMouseMove, false );
	  this.domElement.addEventListener( 'mousedown', this.onMouseDown, false );
	  this.domElement.addEventListener( 'mouseup', this.onMouseUp, false );
	  window.addEventListener( 'keydown', this.onKeyDown, false );
    window.addEventListener( 'keyup', this.onKeyUp, false );
    
    this.handleResize();
  }

  private handleResize = () => {
		if ( this.domElement === document ) {
			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;
    }
    else {
			this.viewHalfX = this.domElement.offsetWidth / 2;
			this.viewHalfY = this.domElement.offsetHeight / 2;
		}
  }
  
  private onMouseDown = (event: any) => {
		if ( this.domElement !== document ) {
			this.domElement.focus();
		}

		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = true; break;
				case 2: this.moveBackward = true; break;
			}
		}

		this.mouseDragOn = true;
  }
  
  private onMouseUp = (event: any) => {
		event.preventDefault();
		event.stopPropagation();

		if ( this.activeLook ) {
			switch ( event.button ) {
				case 0: this.moveForward = false; break;
				case 2: this.moveBackward = false; break;
			}
		}

		this.mouseDragOn = false;
  }
  
  private onMouseMove = (event: any) => {
		if ( this.domElement === document ) {
			//this.mouseX = event.pageX - this.viewHalfX;
			//this.mouseY = event.pageY - this.viewHalfY;
    }
    else {
			//this.mouseX = event.pageX - this.domElement.offsetLeft - this.viewHalfX;
			//this.mouseY = event.pageY - this.domElement.offsetTop - this.viewHalfY;
		}
  }
  
  private onKeyDown = (event: any) => {
		//event.preventDefault();

		switch ( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = true; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = true; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = true; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = true; break;

			case 82: /*R*/ this.moveUp = true; break;
      case 70: /*F*/ this.moveDown = true; break;
      
      case 81: /*Q*/ this.turnLeft = true; break; 
      case 69: /*E*/ this.turnRight = true; break;
		}
	}

	private onKeyUp = (event: any) => {
		switch ( event.keyCode ) {
			case 38: /*up*/
			case 87: /*W*/ this.moveForward = false; break;

			case 37: /*left*/
			case 65: /*A*/ this.moveLeft = false; break;

			case 40: /*down*/
			case 83: /*S*/ this.moveBackward = false; break;

			case 39: /*right*/
			case 68: /*D*/ this.moveRight = false; break;

			case 82: /*R*/ this.moveUp = false; break;
      case 70: /*F*/ this.moveDown = false; break;
      
      case 81: /*Q*/ this.turnLeft = false; break; 
      case 69: /*E*/ this.turnRight = false; break;
		}
  }
  
  public update = (delta: any) => {
		if ( this.enabled === false ) return;
		if ( this.heightSpeed ) {
			var y = Math.clamp( this.object.position.y, this.heightMin, this.heightMax );
			var heightDelta = y - this.heightMin;
			this.autoSpeedFactor = delta * ( heightDelta * this.heightCoef );
		} else {
			this.autoSpeedFactor = 0.0;
		}

		var actualMoveSpeed = delta * this.movementSpeed;

		if ( this.moveForward || ( this.autoForward && ! this.moveBackward ) ) this.object.translateZ( - ( actualMoveSpeed + this.autoSpeedFactor ) );
		if ( this.moveBackward ) this.object.translateZ( actualMoveSpeed );
		if ( this.moveLeft ) this.object.translateX( - actualMoveSpeed );
		if ( this.moveRight ) this.object.translateX( actualMoveSpeed );
		if ( this.moveUp ) this.object.translateY( actualMoveSpeed );
		if ( this.moveDown ) this.object.translateY( - actualMoveSpeed );

		var actualLookSpeed = delta * this.lookSpeed;
		if ( ! this.activeLook ) {
			actualLookSpeed = 0;
		}

		var verticalLookRatio = 1;

		if ( this.constrainVertical ) {
			verticalLookRatio = global.Math.PI / ( this.verticalMax - this.verticalMin );
		}

		this.lon += this.mouseX * actualLookSpeed;
		if ( this.lookVertical ) this.lat -= this.mouseY * actualLookSpeed * verticalLookRatio;

		this.lat = global.Math.max( - 85, global.Math.min( 85, this.lat ) );
		this.phi = Math.degToRad( 90 - this.lat );

		this.theta = Math.degToRad( this.lon );

		if ( this.constrainVertical ) {
			this.phi = Math.mapLinear( this.phi, 0, global.Math.PI, this.verticalMin, this.verticalMax );
		}

		var targetPosition = this.target, position = this.object.position;

		targetPosition.x = position.x + 100 * global.Math.sin( this.phi ) * global.Math.cos( this.theta );
		targetPosition.y = position.y + 100 * global.Math.cos( this.phi );
		targetPosition.z = position.z + 100 * global.Math.sin( this.phi ) * global.Math.sin( this.theta );

		this.object.lookAt( targetPosition );
  }
  
  private contextmenu = (event: any) => {
		event.preventDefault();
	}

	public dispose = () => {
		this.domElement.removeEventListener( 'contextmenu', this.contextmenu, false );
		this.domElement.removeEventListener( 'mousedown', this.onMouseDown, false );
		this.domElement.removeEventListener( 'mousemove', this.onMouseMove, false );
		this.domElement.removeEventListener( 'mouseup', this.onMouseUp, false );
		window.removeEventListener( 'keydown', this.onKeyDown, false );
		window.removeEventListener( 'keyup', this.onKeyUp, false );
	};
}
