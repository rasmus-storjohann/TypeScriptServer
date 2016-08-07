"use strict";

import * as typeMoq from "typemoq";
var request = require("supertest");
import * as express from "express";

import { ContactsExpressAdapter } from "../ContactsExpressAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";

describe("ContactsExpressAdapter integration tests", () => {
  var subject : ContactsExpressAdapter;
  var mockService: typeMoq.Mock<MockContactService>;
  var expressApp;

  var someContacts = [{ _id: 3, _firstName: "FirstName", _lastName: "LastName", _star: true },
                      { _id: 5, _firstName: "FirstName2", _lastName: "LastName2", _star: false }];

  // TODO this should be in the beforeEach too
  mockService = typeMoq.Mock.ofType(MockContactService);

  beforeEach(() => {
    subject = new ContactsExpressAdapter(mockService.object);
    expressApp = express();
    expressApp.use("/", subject.Router());
  });

  describe("get contacts list", () => {

    mockService.setup(x => x.loadAllContacts()).returns(() => someContacts);

    it("should return contacts", (done) => {

      request(expressApp).get("/contacts")
                         .expect(/\"_firstName\"\:\"FirstName\"/)
                         .expect("Content-Type", /json/)
                         .expect("Content-Length", "146")
                         .expect(200, done);
    });
  });
});
