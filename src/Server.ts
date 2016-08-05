/// <reference path="_all.d.ts" />

"use strict";

import * as expressAdapter from "./adapters/ContactsExpressAdapter";
import * as contactRepository from "./adapters/ContactRepository";
import * as contactService from "./businessObjects/ContactService";

import * as express from "express";
import * as path from "path";

export class Server {
  private _application: express.Application;
  private _port: number;

  private _expressAdapter: expressAdapter.ContactsExpressAdapter;
  private _contactRepository: contactRepository.ContactRepository;
  private _contactService: contactService.ContactService;

  constructor() {
    this._contactRepository = new contactRepository.ContactRepository;
    this._contactService = new contactService.ContactService(this._contactRepository);
    this._expressAdapter = new expressAdapter.ContactsExpressAdapter(this._contactService);

    this._port = 3000;
    this._application = express();

    var aboutRouter = express.Router();

    aboutRouter.get("/about", function(req, res) {
      console.log("Sending about!");
      res.send("About");
    });

    this._application.use("/", aboutRouter);
    this._application.use("/", this._expressAdapter.Router());
  }

  public listen() {
    this._application.listen(this._port, function () {
        console.log("Example app listening on port 3000!");
    });
  }
}
