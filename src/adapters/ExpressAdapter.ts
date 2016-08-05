/// <reference path="../_all.d.ts" />

"use strict";

import * as express from "express";

import { IWebAdapter } from "../businessInterfaces/IWebAdapter";

export class ExpressAdapter implements IWebAdapter {
  public Router() {
    var router = express.Router();

    router.get("/", function(req, res) {
      console.log("Sending Hello World!");
      res.send("Hello World!");
    });

    return router;
  }
}
