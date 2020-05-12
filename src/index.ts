import Args from "./arg";
import * as gui from "./gui";
import Ports from "./ports";

import Flash from './libs/flash'
import Configure from './libs/configure'
import Erase from "./libs/erase";
import SerialGuess from "./libs/serialport_guess";

const DEFAULT_BAUD = 1500000;
const DEFAULT_HARDWARE = 'esp32w';
const DEFAULT_VERSION = '3.2.0';

// ========== Global Errors =========

process.on("uncaughtException", (err) => {
  console.error(err);
  throw err;
});

process.on("unhandledRejection", (err) => {
  console.error(err);
  throw err;
});

// ========== Routes =========

async function preparePort(args: any): Promise<any> {
  let portname: string = args.p || args.port;
  if (!portname) {
    portname = await SerialGuess();
    if (portname) {
      console.log(`Guessed Serial Port ${portname}`)
    }
  }
  let baud: any = args.b || args.baud;
  if (!baud) {
    baud = DEFAULT_BAUD;
  }
  if (!portname) {
    console.log(`No port defined. And auto detect failed`);
    process.exit(0);
  }
  return {
    portname,
    baud
  }
}

const routes = {
  "login": {
    async execute(args: any) {

    },
  },
  "os:create": {
    async execute(args: any) {
      let obj = await preparePort(args);
      obj.stdout = (text: string) => {
        console.log(text);
      }
    },
  },
  "os:flash": {
    async execute(args: any) {
      // flashing os
      let obj:any = await preparePort(args);
      let version: any = args.v || args.version;
      if (!version) {
        version = DEFAULT_VERSION;
      }
      let hardware: any = args.h || args.hardware;
      if (!hardware) {
        hardware = DEFAULT_HARDWARE;
      }
      obj.version = version;
      obj.hardware = hardware;
      obj.stdout = (text: string) => {
        console.log(text);
      }
      await Flash(obj);
      // Need something configration after flashing
      let devicekey: any = args.k || args.devicekey;
      if (devicekey) {
        obj.configs = obj.configs || {};
        obj.configs.devicekey = devicekey;
      }
      if(obj.configs) {
        const obniz_id = await Configure(obj);
        console.log(`*** configured device.\n obniz_id = ${obniz_id}`)
      }

    },
  },
  "os:erase": {
    async execute(args: any) {
      let obj = await preparePort(args);
      obj.stdout = (text: string) => {
        console.log(text);
      },
      await Erase(obj);
    },
  },
  "os:ports": {
    async execute(args: any) {
      await Ports();
    },
  },
  "gui": {
    async execute(args: any) {
      console.log(`Launching...`);
      try {
        await gui.start();
      } catch (e) {
        console.error(`Failed to Launch GUI`);
        console.error(e);
        process.exit(1);
      }
    },
  },
  "help": async () => {
    console.log(`CLI to interact with obniz

VERSION
  obniz-cli/${require("../package.json").version}

USAGE
  $ obniz-cli [COMMAND]

COMMANDS

  login       Login to obniz cloud.

  gui         Launch GUI mode of obniz-cli

  os:create   Flashing and configure target device and registrate it on your account on obnizCloud.
               ARGS: -h XXX -v X.X.X -p XXX -b XXX -config XXXX -continue yes
  os:flash    Flashing and configure target device.
               ARGS: -h XXX -v X.X.X -p XXX -b XXX -k XXXX -config XXXX -continue yes
  os:erase    Fully erase a flash on target device.
               ARGS: -p XXX
  os:terminal Simply Launch terminal
               ARGS: -p XXX
  os:ports    Getting serial ports on your machine.
  `);
  },
};

Args(routes)
  .then(() => {})
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });