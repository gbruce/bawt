import { ISimpleEvent } from 'strongly-typed-events';

export enum SocketEvent {
  OnConnected = 'OnConnected',
  OnDisconnected = 'OnDisconnected',
  OnDataReceived = 'OnDataReceived',
  OnDataSent = 'OnDataSent',
}

export interface ISocket {
  connect(host: string, port: number): Promise<void>;
  disconnect(): Promise<void>;
  sendBuffer(buffer: ArrayBuffer): boolean;
  OnDataReceived: ISimpleEvent<Buffer>;
  OnPacketSent: ISimpleEvent<ArrayBuffer>;
}
