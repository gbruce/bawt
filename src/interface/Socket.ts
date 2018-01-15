import Packet from '../lib/net/Packet';

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
  on(event: SocketEvent, listener: (...args: any[]) => void): void;
}
