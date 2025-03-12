export interface IAPP {
  id: string;
  type: "APP" | "CHANNEL";
  appId: string;
  platform: string;
  accessToken: string;
  brandId: string;
}
