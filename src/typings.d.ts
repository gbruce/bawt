
declare class ByteBuffer {
  writeString( str: string, offset?: number ): ByteBuffer | number;
}

declare module "*.json" {
  const value: any;
  export default value;
}
