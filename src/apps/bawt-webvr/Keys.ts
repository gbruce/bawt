
export class Keys {
  static MODIFIERS	= ['shift', 'ctrl', 'alt', 'meta'];
  static ALIAS: any	= {
    'left'		: 37,
    'up'		: 38,
    'right'		: 39,
    'down'		: 40,
    'space'		: 32,
    'pageup'	: 33,
    'pagedown'	: 34,
    'tab'		: 9
  };
  private keyCodes: any = {};
  private modifiers: any = {};
  private onKeyDown: any;
  private onKeyUp: any;

  constructor() {	
    // create callback to bind/unbind keyboard events
    this.onKeyDown = ((event: any) => {
      this.onKeyChanged(event, true);
    }).bind(this);

    this.onKeyUp = ((event: any) => {
      this.onKeyChanged(event, false);
    }).bind(this);

    // bind keyEvents
    document.addEventListener('keydown', this.onKeyDown, false);
    document.addEventListener('keyup', this.onKeyUp, false);
  }

  public dispose() {
    document.removeEventListener("keydown", this.onKeyDown, false);
	  document.removeEventListener("keyup", this.onKeyUp, false);
  }

  private onKeyChanged = (event: any, pressed: boolean) => {
    // update this.keyCodes
	  var keyCode	= event.keyCode;
	  this.keyCodes[keyCode] = pressed;

    // update this.modifiers
    this.modifiers['shift']= event.shiftKey;
    this.modifiers['ctrl']	= event.ctrlKey;
    this.modifiers['alt']	= event.altKey;
    this.modifiers['meta']	= event.metaKey;
  }

  public pressed = (keyDesc: any) => {
    const keys = keyDesc.split("+");
    for(let i = 0; i < keys.length; i++){
      var key	= keys[i];
      var pressed;
      if( Keys.MODIFIERS.indexOf( key ) !== -1 ){
        pressed	= this.modifiers[key];
      }else if( Object.keys(Keys.ALIAS).indexOf( key ) != -1 ){
        pressed	= this.keyCodes[ Keys.ALIAS[key] ];
      }else {
        pressed	= this.keyCodes[key.toUpperCase().charCodeAt(0)]
      }
      if( !pressed)	return false;
    };
    return true;
  }
}
