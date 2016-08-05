/// <reference path="../_all.d.ts" />

"use strict";

import * as contactService from "../businessObjects/ContactService";
import * as express from "express";
import * as bodyParser from "body-parser";

export class ContactsExpressAdapter {
  private _contactService: contactService.ContactService;

  constructor(contactService: contactService.ContactService) {
    this._contactService = contactService;
  }

  public Router() {
    var service = this._contactService;

    var router = express.Router();
    router.use(bodyParser.json());
    router.get("/contact", function(req, res) {  res.json(service.loadContact()); })
    //.get("/contact/:id", function(req, res) {   res.json(service.loadContact(req.id)); })
    //.put("/contact/:id", function(req, res) {   res.json(service.saveContact()); })
    .post("/contact", function(req, res, next) {  res.send(service.saveContact(req.body)); })
    ;

    return router;
  }
}
