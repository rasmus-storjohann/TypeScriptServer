/// <reference path="../_all.d.ts" />

"use strict";

import * as contactService from "../businessObjects/ContactService";
import * as express from "express";

export class ContactsExpressAdapter {
  private _contactService: contactService.ContactService;

  constructor(contactService: contactService.ContactService) {
    this._contactService = contactService;
  }

  public Router() {
    var router = express.Router();
    var service = this._contactService;

    router.get("/", function(req, res) {
      var contact = service.loadContact();

      console.log("Sending contact!");
      res.json(contact);
    });

    return router;
  }
}
