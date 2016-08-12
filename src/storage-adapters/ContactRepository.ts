"use strict";

import { IContactRepository } from "../businessInterfaces/IContactRepository";
import { Contact } from "../businessInterfaces/Contact";

export class ContactRepository implements IContactRepository {
    private _contact: Contact[];

    constructor() {
        this._contact = [new Contact(0, "From", "Repository", false)];
    }

    saveContact(contact: Contact) {
        console.log("Saving contact with id = " +
        contact._id + ", first name = " +
        contact._firstName + ", last name = " +
        contact._lastName + " and star = " +
        contact._star);

        this._contact[contact._id] = contact;
        return contact;
    }

    updateContact(id: number, contact: Contact) {
        this._contact[id] = contact;
        return contact;
    }

    loadAllContacts() {
        return this._contact;
    }

    loadContact(id: number) {
        return this._contact[id];
    }

    deleteContact(id: number) {
        delete this._contact[id];
    }
}
