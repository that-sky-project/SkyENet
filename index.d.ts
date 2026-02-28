/**
 * MIT License
 * 
 * Copyright (c) 2025 Yoru Akio
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// @note type declarations for gtenet to improve editor intellisense

export type PeerId = bigint;

export interface ConnectEvent {
  type: 'connect';
  peer: PeerId;
}

export interface DisconnectEvent {
  type: 'disconnect';
  peer: PeerId;
  data: number;
}

export interface ReceiveEvent {
  type: 'receive';
  peer: PeerId;
  channelID: number;
  data: Buffer;
}

export interface UnknownEvent {
  type: 'unknown';
}

export type ENetEvent =
  | ConnectEvent
  | DisconnectEvent
  | ReceiveEvent
  | UnknownEvent;

export type BaseEventName = 'connect' | 'disconnect' | 'receive' | 'error';

export interface ServerOptions {
  ip?: string;
  address?: string;
  port?: number;
  maxPeer?: number;
  channelLimit?: number;
  usingNewPacketForServer?: boolean;
  incomingBandwidth?: number;
  outgoingBandwidth?: number;
  checksum?: boolean;
  compression?: boolean;
}

export interface ClientOptions {
  ip?: string;
  address?: string;
  port?: number;
  channelLimit?: number;
  usingNewPacket?: boolean;
  incomingBandwidth?: number;
  outgoingBandwidth?: number;
  checksum?: boolean;
  compression?: boolean;
}

/**
 * High-level ENet server wrapper
 */
export class Server {
  constructor(options?: ServerOptions);

  // @note event subscriptions
  on(event: 'connect', handler: (event: ConnectEvent) => void): this;
  on(event: 'disconnect', handler: (event: DisconnectEvent) => void): this;
  on(event: 'receive', handler: (event: ReceiveEvent) => void): this;
  on(event: 'error', handler: (error: Error) => void): this;
  on(event: 'ready', handler: () => void): this;
  off(event: BaseEventName | 'ready', handler: (...args: any[]) => void): this;
  once(event: BaseEventName | 'ready', handler: (...args: any[]) => void): this;

  // @note lifecycle
  initialize(): boolean;
  deinitialize(): void;
  destroy(): void;

  // @note host/event loop
  service(timeout?: number): ENetEvent | null;
  listen(pollIntervalMs?: number, maxPollIntervalMs?: number): Promise<void>;
  stop(): void;

  // @note server setup
  createServer(): Promise<boolean>;
  start(): Promise<void>;
  static create(options?: ServerOptions): Promise<Server>;

  // @note data and connections
  send(
    peerId: PeerId,
    channelId: number,
    data: Buffer | string,
    reliable?: boolean,
  ): number;
  sendRawPacket(
    peerId: PeerId,
    channelId: number,
    data: Buffer | Uint8Array | ArrayBuffer,
    flags?: number,
  ): number;
  disconnect(peerId: PeerId, data?: number): void;
  disconnectNow(peerId: PeerId, data?: number): void;
  disconnectLater(peerId: PeerId, data?: number): void;
  broadcast(channelId: number, data: Buffer | string, reliable?: boolean): void;
}

/**
 * High-level ENet client wrapper
 */
export class Client {
  constructor(options?: ClientOptions);

  // @note event subscriptions
  on(event: 'connect', handler: (event: ConnectEvent) => void): this;
  on(event: 'disconnect', handler: (event: DisconnectEvent) => void): this;
  on(event: 'receive', handler: (event: ReceiveEvent) => void): this;
  on(event: 'error', handler: (error: Error) => void): this;
  off(event: BaseEventName, handler: (...args: any[]) => void): this;
  once(event: BaseEventName, handler: (...args: any[]) => void): this;

  // @note lifecycle
  initialize(): boolean;
  deinitialize(): void;
  destroy(): void;

  // @note host/event loop
  service(timeout?: number): ENetEvent | null;
  stop(): void;
  flush(): void;

  // @note connection helpers
  connect(options?: { timeoutMs?: number }): Promise<void>;

  // @note instance methods target connected server by default
  send(channelId: number, data: Buffer | string, reliable?: boolean): number;
  sendRawPacket(
    channelId: number,
    data: Buffer | Uint8Array | ArrayBuffer,
    flags?: number,
  ): number;
  disconnect(data?: number): void;
  disconnectNow(data?: number): void;
  disconnectLater(data?: number): void;

  // @note still expose low-level methods via Base class through TS, but Client overrides instance signatures
  // The Client instance methods above shadow the base signatures that include peerId.

  // @note current server peer id if connected
  serverPeer: PeerId | null;
}

// @note packet flags (mirror ENet constants)
export const PACKET_FLAG_RELIABLE: 1;
export const PACKET_FLAG_UNSEQUENCED: 2;
export const PACKET_FLAG_NO_ALLOCATE: 4;
export const PACKET_FLAG_UNRELIABLE_FRAGMENT: 8;
export const PACKET_FLAG_SENT: 256;

// @note default export for convenience
export default {
  Client: Client,
  Server: Server,
};
