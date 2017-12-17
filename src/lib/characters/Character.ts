class Character {
  public guid: any;
  public name: string;
  public race: any;
  public class: any;
  public gender: any;
  public bytes: any;
  public facial: any;
  public level: any;
  public zone: any;
  public map: any;
  public x: any;
  public y: any;
  public z: any;
  public guild: any;
  public flags: any;
  public pet: any;
  public equipment: any[];

  // Short string representation of this character
  toString() {
    return `[Character; GUID: ${this.guid}]`;
  }

}

export default Character;
