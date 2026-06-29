import "express";

declare module "express" {
  export interface Request {
    query: any;
    params: any;
    headers: any;
    protocol: string;
    originalUrl: string;
  }

  export interface Response {
    status(code: number): this;
    json(body: any): this;
    send(body: any): this;
    sendFile(path: string): void;
    cookie(name: string, value: string, options: any): this;
    clearCookie(name: string, options?: any): this;
    redirect(status: number, url: string): void;
    redirect(url: string): void;
    set(field: string, value?: string): this;
    set(headers: Record<string, string>): this;
    end(data?: any): void;
  }

  export type NextFunction = (err?: any) => void;

  export interface Express {
    get(path: string, ...handlers: any[]): void;
    post(path: string, ...handlers: any[]): void;
    use(...handlers: any[]): void;
  }
}
