import Packet from '../lib/net/Packet';
import { Packet as IPacket } from '../interface/Packet';

export enum SocketEvent {
  OnConnected = 'OnConnected',
  OnDisconnected = 'OnDisconnected',
  OnDataReceived = 'OnDataReceived',
  OnDataSent = 'OnDataSent',
}

export interface Socket {
  connect(host: string, port: number): void;
  disconnect(): void;
  send(packet: Packet): boolean;
  sendPacket(packet: IPacket): boolean;
  sendBuffer(buffer: ArrayBuffer): boolean;
  on(event: SocketEvent, listener: (...args: any[]) => void): void;
}
