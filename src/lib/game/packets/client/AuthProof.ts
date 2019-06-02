import ByteBuffer from 'bytebuffer';
import { Serialize, UInt8Prop, UInt16Prop, UInt32Prop, UInt64Prop, StringProp,
  StringNoNullProp, ByteArrayProp, ConstByteBufferProp } from 'bawt/net/Serialization';
import { ClientPacket } from './ClientPacket';
import { IFactory } from 'interface/IFactory';
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

  @Serialize(UInt32Prop())
  public Unk1: number = 0;

  @Serialize(ByteArrayProp(() => 4))
  public Seed: number[] = [];

  @Serialize(UInt32Prop())
  public Unk2: number = 0;

  @Serialize(UInt32Prop())
  public Unk3: number = 0;

  @Serialize(UInt32Prop())
  public Unk4: number = 0;

  @Serialize(UInt64Prop())
  public Unk5: number = 0;

  @Serialize(ByteArrayProp(() => 20))
  public Digest: number[] = [];

  @Serialize(ConstByteBufferProp())
  public AddOn: ByteBuffer = AuthProof.addOnHex2;

  // 1.12.1
  // tslint:disable-next-line:max-line-length
  private static addOnHex2 = ByteBuffer.fromHex('56010000789c75ccbd0ec2300c04e0f21ebc0c614095c842c38c4ce2220bc7a98ccb4f9f1e16240673eb777781695940cb693367a326c7be5bd5c77adf7d12be16c08c7124e41249a8c2e495480ac9c53dd8b67a064bf8340f15467367bb38cc7ac7978bbddc26ccfe3042d6e6ca01a8b8908051fcb7a45070b812f33f2641fdb5379019668f');

  // 3.5
  // tslint:disable-next-line:max-line-length
  private static addOnHex = ByteBuffer.fromHex('9e020000789c75d2c16ac3300cc671ef2976e99becb4b450c2eacbe29e8b627f4b446c39384eb7f63dfabe65b70d94f34f48f047afc69826f2fd4e255cdefdc8b82241eab9352fe97b7732ffbc404897d557cea25a43a54759c63c6f70ad115f8c182c0b279ab52196c032a80bf61421818a4639f5544f79d834879faae001fd3ab89ce3a2e0d1ee47d20b1d6db7962b6e3ac6db3ceab2720c0dc9a46a2bcb0caf1f6c2b5297fd84ba95c7922f59954fe2a082fb2daadf739c60496880d6dbe509fa13b84201ddc4316e310bca5f7b7b1c3e9ee193c88d');
}
