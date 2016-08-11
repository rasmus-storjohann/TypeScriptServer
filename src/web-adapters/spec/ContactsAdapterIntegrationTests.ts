"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";
var request = require("supertest");
var feathers = require("feathers");

import { ContactsFeathersAdapter } from "../ContactsFeathersAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";
import { ContactFixture } from "../../businessInterfaces/test-helpers/ContactFixture";

describe("ContactsWebAdapterIntegrationTests", () => {
  var subject : ContactsFeathersAdapter;
  var mockService: typeMoq.Mock<MockContactService>;
  var contactFixture = new ContactFixture();
  var feathersApp;

  beforeEach(() => {
    mockService = typeMoq.Mock.ofType(MockContactService);
    subject = new ContactsFeathersAdapter(mockService.object);
    feathersApp = feathers();
    feathersApp.use("/", subject.Router());
  });

  describe("GET all", () => {

    it("should return contacts from service", (done) => {

      var severalContacts = contactFixture.buildMany();

      mockService.setup(x => x.loadAllContacts()).returns(() => severalContacts);
      request(feathersApp).get("/contacts")
                         .expect("Content-Type", /json/)
                         .expect(200)
                         .end(function(err, res) {

/*
                          var foo = res.body;
                           for (var index in foo) {
                               if (foo.hasOwnProperty(index)) {
                                   console.log(foo[index]);
                               }
                            }
                            */

                           var responseBody = res.body;
                           chai.expect(responseBody).to.have.lengthOf(severalContacts.length);
                           // TODO loop here
                           chai.expect(responseBody[0]._firstName).to.equal(severalContacts[0]._firstName);
                           chai.expect(responseBody[1]._firstName).to.equal(severalContacts[1]._firstName);
                           chai.expect(responseBody[2]._firstName).to.equal(severalContacts[2]._firstName);
                           done();
                         });
    });
  });

  describe("GET by id", () => {
    it ("should return contact with given id from service", (done) => {
      var bob = contactFixture.withFirstName("Bob").build();
      var id = bob._id;

      mockService.setup(x => x.loadContact(id)).returns(() => bob);
      request(feathersApp).get("/contact/" + id)
                         .expect(/\"_firstName\"\:\"Bob\"/)
                         .expect("Content-Type", /json/)
                         .expect(200)
                         .end(function(err, res) {
                           var responseBody = res.body;
                           chai.expect(responseBody._firstName).to.equal("Bob");
                           done();
                         });
    });

    it("should return 404 when service throws NoSuchModel", (done) => {
      var id = 5;
      //mockService.setup(x => x.loadContact(id)).returns(() : Contact => { throw Error(""); });
      request(feathersApp).get("/contact/" + id)
                         .expect(404)
                         .end(function(err, res) {
                           var errorBody = err.body;
                           done();
                         });
    });
  });

  describe("POST", () => {
    it("should return contact from service", (done) => {
      var aContact = contactFixture.build();
      mockService.setup(x => x.saveContact(aContact)).returns(() => aContact);
      request(feathersApp).post("/contact")
                         .send(aContact)
                         .set("Accept", "application/json")
                         .expect(200, done);
    });
  });


  describe("PUT", () => {
    it("should return contact from service", (done) => {
      var aContact = contactFixture.build();
      var id = aContact._id;
      mockService.setup(x => x.updateContact(id, aContact)).returns(() => aContact);
      request(feathersApp).post("/contact/" + id)
                         .send(
                           {
                             _id: 3,
                             _firstName: "",
                             _lastName: "",
                             _start: true
                           }
                         )
                         .set("Accept", "application/json")
                         .expect("Content-Type", /json/)
                         .expect(200)
                         .end(function(err, res) {
                           chai.expect(res.body._id).to.equal(5);
                           done();
                         });
    });
  });
});
