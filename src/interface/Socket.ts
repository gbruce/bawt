import Packet from '../lib/net/Packet';
import { Packet as IPacket } from '../interface/Packet';
import { ISimpleEvent } from 'strongly-typed-events';

export enum SocketEvent {
  OnConnected = 'OnConnected',
  OnDisconnected = 'OnDisconnected',
  OnDataReceived = 'OnDataReceived',
  OnDataSent = 'OnDataSent',
}

export interface Socket {
  connect2(host: string, port: number): Promise<void>;
  disconnect(): void;
  sendBuffer(buffer: ArrayBuffer): boolean;
  OnDataReceived: ISimpleEvent<Buffer>;
  OnPacketSent: ISimpleEvent<ArrayBuffer>;
}
