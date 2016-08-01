/// <reference path="../_all.d.ts" />

"use strict";

import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";

export class ExpressAdapter {
    private app: express.Application;

    constructor() {
        this.app = express();

        this.app.get("/", function(req, res) {
          console.log("Sending Hello World!");
          res.send("Hello World!");
        });
    }

    public listen() {
      this.app.listen(3000, function () {
          console.log("Example app listening on port 3000!");
      });
    }
}
