/// <reference path="_all.d.ts" />

"use strict";

import * as expressAdapter from "./adapters/ExpressAdapter";
import * as contactRepository from "./adapters/ContactRepository";
import * as contactService from "./businessObjects/ContactService";

import * as bodyParser from "body-parser";
import * as express from "express";
import * as path from "path";

export class Server {
  private _application: express.Application;
  private _router : express.Router;
  private _port: number;

  private _expressAdapter: expressAdapter.ExpressAdapter;
  private _contactRepository: contactRepository.ContactRepository;
  private _contactService: contactService.ContactService;

  constructor() {
    this._expressAdapter = new expressAdapter.ExpressAdapter();
    this._contactRepository = new contactRepository.ContactRepository;
    this._contactService = new contactService.ContactService(this._contactRepository, this._expressAdapter);

    this._port = 3000;
    this._application = express();
    this._router = express.Router();

    this._router.get("/", function(req, res) {
      console.log("Sending Hello World!");
      res.send("Hello World!");
    });

    this._application.use("/", this._router);
  }

  public listen() {
    this._application.listen(this._port, function () {
        console.log("Example app listening on port 3000!");
    });
  }
}
