import * as ByteBuffer from 'bytebuffer';
import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, StringProp,
  StringNoNullProp, ByteArrayProp, ConstByteBufferProp } from '../../../net/Serialization';
import { ClientPacket } from './ClientPacket';
import { Factory } from '../../../../interface/Factory';
import Opcode from '../../Opcode';

export class AuthProof extends ClientPacket {
  constructor() {
    super(Opcode.CMSG_AUTH_PROOF);
  }

  @Serialize(UInt32Prop())
  public Build: number = 0;

  @Serialize(UInt32Prop())
  public LoginServerId: number = 0;

  @Serialize(StringProp())
  public Account: string = '';

  @Serialize(ByteArrayProp(() => 4))
  public Seed: number[] = [];

  @Serialize(ByteArrayProp(() => 20))
  public Digest: number[] = [];

  @Serialize(ConstByteBufferProp())
  public AddOn: ByteBuffer = AuthProof.addOnHex2;

  // tslint:disable-next-line:max-line-length
  private static addOnHex2 = ByteBuffer.fromHex('56010000789c75ccbd0ec2300c04e0f21ebc0c614095c842c38c4ce2220bc7a98ccb4f9f1e16240673eb777781695940cb693367a326c7be5bd5c77adf7d12be16c08c7124e41249a8c2e495480ac9c53dd8b67a064bf8340f15467367bb38cc7ac7978bbddc26ccfe3042d6e6ca01a8b8908051fcb7a45070b812f33f2641fdb5379019668f');
}
