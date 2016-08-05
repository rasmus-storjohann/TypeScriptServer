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

    router.get("/contacts", function(req, res) {  res.json(service.loadContact()); })
    //.get("/contact/:id", function(req, res) {   res.json(service.loadContact(req.id)); })
    //.put("/contact/:id", function(req, res) {   res.json(service.saveContact()); })
    //.post("/contact", function(req, res) {      res.json(service.saveContact()); })
    ;

    return router;
  }
}
