export interface IConfig {
  readonly AuthServer: string;
  readonly Port: number;
  readonly Realm: string;
  readonly Character: string;
  readonly Account: string;
  readonly Password: string;
  readonly Game: string;
  readonly Major: number;
  readonly Minor: number;
  readonly Patch: number;
  readonly Build: number;
  readonly Platform: string;
  readonly Os: string;
  readonly Locale: string;
  readonly Timezone: number;
  readonly IPAddress: number;
}
