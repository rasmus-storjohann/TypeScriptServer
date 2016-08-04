"use strict";

import { IWebAdapter } from "../businessInterfaces/IWebAdapter";
import { IContactRepository } from "../businessInterfaces/IContactRepository";
import { Contact } from "../businessInterfaces/Contact";

export class ContactService {
  private _repository: IContactRepository;
  private _webAdapter: IWebAdapter;

  constructor(repository: IContactRepository, webAdapter: IWebAdapter) {
    this._repository = repository;
    this._webAdapter = webAdapter;
  }

  saveContact(contact: Contact) {
    return this._repository.saveContact(contact);
  }

  loadContact() {
    return this._repository.loadContact();
  }
}
