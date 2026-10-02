interface CursaiAPI {
  window:{toggle():Promise<boolean>;show():Promise<boolean>;hide():Promise<boolean>};
  screen:{sources():Promise<Array<{id:string;name:string;thumbnail:string}>>;capture():Promise<string>;display():Promise<{cursor:{x:number;y:number};bounds:object;workArea:object;scaleFactor:number}>};
  system:{open(url:string):Promise<boolean>;cwd():Promise<string>};
  settings:{get():Promise<{voice?:boolean;alwaysOnTop?:boolean;launchOnStartup?:boolean}>;set(patch:Record<string,unknown>):Promise<Record<string,unknown>>};
  agents:{status():Promise<Array<{name:string;running:boolean}>>};
  pc:{position():Promise<{x:number;y:number}>;move(x:number,y:number):Promise<unknown>;click(button?:string):Promise<unknown>;scroll(amount:number):Promise<unknown>;type(text:string):Promise<unknown>;press(key:string):Promise<unknown>;hotkey(keys:string[]):Promise<unknown>};
  ai:{ask(payload:{message:string}):Promise<{success:boolean;text?:string;error?:string}>;vision(payload:{image:string;question:string}):Promise<{success:boolean;text?:string;error?:string}>;transcribe(audio:ArrayBuffer):Promise<{success:boolean;text?:string;error?:string}>};
}
declare global{interface Window{cursai:CursaiAPI}} export {};
