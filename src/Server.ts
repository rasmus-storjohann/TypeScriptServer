/// <reference path="_all.d.ts" />

"use strict";

import * as expressAdapter from "./adapters/ExpressAdapter";

class Server {
    private app: expressAdapter.ExpressAdapter;

    constructor() {
        this.app = new expressAdapter.ExpressAdapter;
    }

    public listen() {
      this.app.listen();
    }
}

exports.Server = Server;
