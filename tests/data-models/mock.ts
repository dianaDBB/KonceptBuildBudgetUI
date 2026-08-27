export type MockParams = {
  response: any;
  method: string;
  responseStatus: number | undefined;
  schema?: any;
  requestPayload?: any;
  contentType?: string;
  headers?: Record<string, string>;
};
