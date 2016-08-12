"use strict";

import * as typeMoq from "typemoq";
import * as chai from "chai";
var request = require("supertest");
var feathers = require("feathers");

import { ContactsFeathersAdapter } from "../ContactsFeathersAdapter";
import { Contact } from "../../businessInterfaces/Contact";
import { MockContactService } from "./MockContactService";
import { ContactFixture } from "../../businessInterfaces/test-helpers/ContactFixture";
import { NoSuchModel } from "../../businessInterfaces/NoSuchModel";

var printAll = function(id, foo) {
    console.log("Printing all for " + id);
    for (var index in foo) {
        if (foo.hasOwnProperty(index)) {
            console.log(foo[index]);
        }
    }
};

describe("ContactsFeathersAdapter", () => {
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
    afterEach(() => {
        // should shut down server here
    });

    it("should return 404 for an invalid path", (done) => {
        request(feathersApp).get("/aNonExistentEndPoint")
                            .expect(404, done);
    });

    describe("GET all", () => {

        it("should return contacts from service", (done) => {

        var severalContacts = contactFixture.buildMany();

        mockService.setup(x => x.loadAllContacts()).returns(() => severalContacts);
        request(feathersApp).get("/contacts")
            .expect("Content-Type", /json/)
            .expect(200)
            .end(function(err, res) {
                var responseBody = res.body;
                chai.expect(responseBody).to.have.lengthOf(severalContacts.length);
                // TODO loop here
                chai.expect(responseBody[0]._firstName).to.equal(severalContacts[0]._firstName);
                chai.expect(responseBody[1]._firstName).to.equal(severalContacts[1]._firstName);
                chai.expect(responseBody[2]._firstName).to.equal(severalContacts[2]._firstName);

                chai.expect(err).to.be.null;
            done();
            });
        });
    });

    describe("GET by id", () => {
        it ("should return contact with given id from service", (done) => {
            var aContact = contactFixture.build();
            var id = aContact._id;
            var firstName = aContact._firstName;

            mockService.setup(x => x.loadContact(id)).returns(() => aContact);
            request(feathersApp).get("/contact/" + id)
                .expect(/\"_firstName\"\:\"{firstName}\"/)
                .expect("Content-Type", /json/)
                .expect(200)
                .end(function(err, response) {
            chai.expect(response.body._firstName).to.equal(firstName);
            done();
        });
    });

    it("should return 404 when service throws NoSuchModel", (done) => {
        var invalidId = 999;
        var throwNoSuchModel = () : Contact => {
            throw new NoSuchModel("Contact does not exist");
        };
        mockService.setup(x => x.loadContact(invalidId)).returns(throwNoSuchModel);
        request(feathersApp).get("/contact/" + invalidId)
            .expect(404)
            .end(function(err, response) {
                chai.expect(err).to.equal("Bla");
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
                .send({
                    _id: 3,
                    _firstName: "",
                    _lastName: "",
                    _start: true
                })
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
