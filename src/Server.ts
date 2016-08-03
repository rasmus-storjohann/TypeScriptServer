/// <reference path="_all.d.ts" />

"use strict";

import * as expressAdapter from "./adapters/ExpressAdapter";

export class Server {
    private expressAdapter: expressAdapter.ExpressAdapter;

    constructor() {
        this.expressAdapter = new expressAdapter.ExpressAdapter;
    }

    public listen() {
      this.expressAdapter.listen();
    }
}
