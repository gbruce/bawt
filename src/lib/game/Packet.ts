import BasePacket from '../net/packet';
import GameOpcode from './opcode';
import ObjectUtil from '../utils/ObjectUtil';

class GamePacket extends BasePacket {

  // Header sizes in bytes for both incoming and outgoing packets
  public static HEADER_SIZE_INCOMING = 4;
  public static HEADER_SIZE_OUTGOING = 6;

  // Opcode sizes in bytes for both incoming and outgoing packets
  public static OPCODE_SIZE_INCOMING = 2;
  public static OPCODE_SIZE_OUTGOING = 4;

  constructor(opcode: any, source: any = null, outgoing = true) {
    super(opcode, source, outgoing);

    if (!source) {
      source = (outgoing) ? GamePacket.HEADER_SIZE_OUTGOING : GamePacket.HEADER_SIZE_INCOMING;
    }
    this.name = ObjectUtil.KeyByValue(GameOpcode, this.opcode);

    if (outgoing) {
      // preallocate packet size(2 bytes)
      this.writeUint16(0);
      // insert opcode
      this.writeUint32(opcode);
    }
  }

  // Header size in bytes (dependent on packet origin)
  get headerSize() {
    if (this.outgoing) {
      return GamePacket.HEADER_SIZE_OUTGOING;
    }
    return GamePacket.HEADER_SIZE_INCOMING;
  }

  // Writes given GUID to this packet
  public writeGUID(guid: any) {
    this.append(guid.raw);
    return this;
  }
}

export default GamePacket;
