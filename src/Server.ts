/// <reference path="_all.d.ts" />

"use strict";

import * as expressAdapter from "./adapters/ExpressAdapter";
import * as contactRepository from "./adapters/ContactRepository";
import * as contactService from "./businessObjects/ContactService";

export class Server {
  private _expressAdapter: expressAdapter.ExpressAdapter;
  private _contactRepository: contactRepository.ContactRepository;
  private _contactService: contactService.ContactService;

  constructor() {
    this._expressAdapter = new expressAdapter.ExpressAdapter;
    this._contactRepository = new contactRepository.ContactRepository;
    this._contactService = new contactService.ContactService(this._contactRepository, this._expressAdapter);
  }

  public listen() {
    this._expressAdapter.listen();
  }
}
