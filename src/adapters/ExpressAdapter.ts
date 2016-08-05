/// <reference path="../_all.d.ts" />

"use strict";

import { IWebAdapter } from "../businessInterfaces/IWebAdapter";

import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";

export class ExpressAdapter implements IWebAdapter {
    private _application: express.Application;
    private _port: number;

    constructor(port: number) {
      this._port = port;
      this._application = express();

      this._application.get("/", function(req, res) {
        console.log("Sending Hello World!");
        res.send("Hello World!");
      });
    }

    public listen() {
      this._application.listen(this._port, function () {
          console.log("Example app listening on port 3000!");
      });
    }
}
