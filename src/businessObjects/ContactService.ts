"use strict";

import { Contact } from "../businessInterfaces/Contact";
import { IContactService } from "../businessInterfaces/IContactService";
import { IContactRepository } from "../businessInterfaces/IContactRepository";

export class ContactService implements IContactService {
    private _repository: IContactRepository;

    constructor(repository: IContactRepository) {
        this._repository = repository;
    }

    saveContact(contact: Contact) {
        return this._repository.saveContact(contact);
    }

    updateContact(id: number, contact: Contact) {
        return this._repository.updateContact(id, contact);
    }

    loadAllContacts() {
        return this._repository.loadAllContacts();
    }

    loadContact(id: number) {
        return this._repository.loadContact(id);
    }

    deleteContact(id: number) {
        this._repository.deleteContact(id);
    }
}
