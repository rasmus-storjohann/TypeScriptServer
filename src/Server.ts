/// <reference path="_all.d.ts" />

"use strict";

import * as feathersWebAdapter from "./web-adapters/ContactsFeathersAdapter";
import * as contactRepository from "./storage-adapters/ContactRepository";
import * as contactService from "./businessObjects/ContactService";

var feathers = require("feathers");
import * as path from "path";

export class Server {
    private _application = feathers();
    private _port: number;

    private _feathersAdapter: feathersWebAdapter.ContactsFeathersAdapter;
    private _contactRepository: contactRepository.ContactRepository;
    private _contactService: contactService.ContactService;

    constructor() {
        this._contactRepository = new contactRepository.ContactRepository;
        this._contactService = new contactService.ContactService(this._contactRepository);
        this._feathersAdapter = new feathersWebAdapter.ContactsFeathersAdapter(this._contactService);

        this._port = 3000;
        this._application = feathers();

        var aboutRouter = feathers.Router();

        aboutRouter.get("/about", function(req, res) {
            console.log("Sending about!");
            res.send("About");
        });

        this._application.use("/", aboutRouter);
        this._application.use("/", this._feathersAdapter.Router());
    }

    public listen() {
        this._application.listen(this._port, function () {
            console.log("Example app listening on port 3000!");
        });
    }
}
