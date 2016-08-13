"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ContactFixture } from "../test-helpers/ContactFixture";
var randomatic = require("randomatic");

class Autofixture<T extends Object> {
    private options;
    constructor(options = {}) {
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
        if (/string\[\d+\]/.test(spec)) {
            return this.generateString(spec);
        }
        return undefined;
    }

    private generateString(spec: string) {
        var match = /string\[(\d+)\]/.exec(spec);
        if (match) {
            var length = parseInt(match[1]);
            return randomatic(length);
        }
        return undefined;
    }
};

describe("Autofixture", () => {

    describe("basic configuration:", () => {

        it("can specify a string of given length", () => {

            class ClassWithString {
                public name: string;
                constructor(name: string) {
                    this.name = name;
                }
            }

            var subject = new Autofixture<ClassWithString>({
                "name" : "string[5]"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string").and.to.have.lengthOf(5);
            chai.expect(value.name).to.have.lengthOf(5);
        });
    });
});
