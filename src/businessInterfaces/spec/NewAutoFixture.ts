"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ContactFixture } from "../test-helpers/ContactFixture";
var randomatic = require("randomatic");

class Autofixture<T extends Object> {
    private options;
    constructor(options) {
        this.options = options;
    }

    public create(t: T) : T {
        this.iterate(this.options, (name, value) => {
            if (t.hasOwnProperty(name)) {
                t[name] = this.generate(value);
            }
        });
        return t;
    }

    private iterate(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property, object[property]);
            }
        }
    }

    private generate(spec: string) {
        if (/^string.*/.test(spec)) {
            return this.generateString(spec);
        }
        if (/^number.*/.test(spec)) {
            return this.generateNumber(spec);
        }
        throw new Error("invalid type in autofixture spec");
    }

    private generateString(spec: string) {
        var match = spec === "string";
        if (match) {
            var defaultLength = 32;
            return randomatic(defaultLength);
        }

        var matchWithLength = /^string\[(\d+)\]$/.exec(spec);
        if (matchWithLength) {
            var length = parseInt(matchWithLength[1]);
            return randomatic(length);
        }
        throw new Error("invalid string autofixture spec");
    }

    private generateNumber(spec: string) {
        var match = spec === "number";
        if (match) {
            return Math.random();
        }
        throw new Error("invalid number autofixture spec");
    }
};

describe("Autofixture", () => {

    describe("creating numbers", () => {

        class ClassWithNumber {
            public value: number;
            constructor(value: number) {
                this.value = value;
            }
        }

        it("with any value", () => {
            var subject = new Autofixture<ClassWithNumber>({
                "value" : "number"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
        });
    });

    describe("creating strings", () => {

        class ClassWithString {
            public name: string;
            constructor(name: string) {
                this.name = name;
            }
        }

        it("with default length", () => {
            var subject = new Autofixture<ClassWithString>({
                "name" : "string"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.length.of.at.least(1);
        });

        it("with a given length", () => {

            var subject = new Autofixture<ClassWithString>({
                "name" : "string[5]"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.lengthOf(5);
        });
    });
});
