"use strict";

import * as typeMoq from "typemoq";
import * as express from "express";
var request = require("supertest");

import { ContactsExpressAdapter } from "../ContactsExpressAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";

describe("ContactsExpressAdapter integration tests", () => {
  //var subject : ContactsExpressAdapter;
  //var mockService: typeMoq.Mock<MockContactService>;
  //var expressApp;

  describe("get contacts list", () => {

    var someContacts = [{ _id: 3, _firstName: "FirstName", _lastName: "LastName", _star: true },
                        { _id: 5, _firstName: "FirstName2", _lastName: "LastName2", _star: false }];

    var mockService = typeMoq.Mock.ofType(MockContactService);
    var subject = new ContactsExpressAdapter(mockService.object);
    var expressApp = express();
    expressApp.use("/", subject.Router());
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
