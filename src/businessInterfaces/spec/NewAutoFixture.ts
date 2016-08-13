"use strict";

import * as chai from "chai";
import { Contact } from "../Contact";
import { ContactFixture } from "../test-helpers/ContactFixture";
var randomatic = require("randomatic");

class Autofixture {
    private options;

    constructor(options = undefined) {
        this.options = options;
    }

    public create<T extends Object>(t: T) : T {
        if (this.options) {
            return this.generateFromOptions<T>(t, this.options);
        } else {
            return this.generateFromTemplate<T>(t);
        }
    }

    private generateFromOptions<T>(t: T, options) : T {

        this.throwIfOptionsContainsFieldsNotIn(t);

        this.iterate(t, (name, value) => {
            if (options.hasOwnProperty(name)) {
                t[name] = this.generate(options[name]);
            } else {
                // clean up duplication
                var type = typeof t[name];
                if (type === "string" || type === "number") {
                    t[name] = this.generate(type);
                } else {
                    this.throwUnsupportedTypeError(type);
                }
            }
        });
        return t;
    }

    private throwIfOptionsContainsFieldsNotIn<T>(t: T) {
        this.iterate(this.options, (name, value) => {
            if (!t.hasOwnProperty(name)) {
                this.throwWrongFieldError(name);
            }
        });
    }

    private throwWrongFieldError(name: string) {
        throw Error("Autofixture specifies field '" + name + "' that is not in the type");
    }

    private generateFromTemplate<T>(t: T) : T {
        this.iterate(t, (name, value) => {
            var type = typeof t[name];
            if (type === "string" || type === "number") {
                t[name] = this.generate(type);
            } else {
                this.throwUnsupportedTypeError(type);
            }
        });
        return t;
    }

    private throwUnsupportedTypeError(type: string) {
        throw Error("Autofixture cannot generate values of type '" + name + "'");
    }

    // todo use a library for this
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
        if (spec === "string") {
            var defaultLength = 32;
            return randomatic(defaultLength);
        }

        var stringWithLength = /^string\[(\d+)\]$/.exec(spec);
        if (stringWithLength) {
            var length = parseInt(stringWithLength[1]);
            return randomatic(length);
        }
        throw new Error("invalid string autofixture spec");
    }

    private generateNumber(spec: string) {
        if (spec === "number") {
            return this.random();
        }

        var matchWithLowerLimit = /^number\s*\>\s*(\d*\.?\d+)$/.exec(spec);
        if (matchWithLowerLimit) {
            var limit = parseFloat(matchWithLowerLimit[1]);
            return limit + this.random();
        }

        var matchWithUpperLimit = /^number\s*\<\s*(\d*\.?\d+)$/.exec(spec);
        if (matchWithUpperLimit) {
            var limit = parseFloat(matchWithUpperLimit[1]);
            return limit - 1 + this.random();
        }

        throw new Error("invalid number autofixture spec");
    }

    private random() {
        return Math.random();
    }
};

describe("Autofixture", () => {

    class ClassWithString {
        public name: string;
        constructor(name: string) {
            this.name = name;
        }
    };

    class ClassWithNumber {
        public value: number;
        constructor(value: number) {
            this.value = value;
        }
    }

    class ClassWithEverything {
        public value: number;
        public name: string;
        constructor() {
            this.name = "";
            this.value = 1;
        }
    };

    // can set a random number provider
    // can use a function as spec for a field, which is passed in the autofixture
    // exposes static functions for string, number and bool creation
    // bool support
    // nested object support
    // generate lists of values

    it("with implicit spec", () => {
        var subject = new Autofixture();
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.name).to.be.a("string");
    });

    /*
    it("with partial spec", () => {
        var subject = new Autofixture({
            "value" : "number > 5"
        });
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.value).to.be.at.least(5);
        chai.expect(value.name).to.be.a("string");
        chai.expect(value.name).to.have.length.of.at.least(1);
    });
    */

    describe("creating numbers", () => {

        it("with any value", () => {
            var subject = new Autofixture({
                "value" : "number"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
        });

        it("with a value above a limit", () => {
            var subject = new Autofixture({
                "value" : "number > 3.2" // TODO test "3" and ".2" too
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number < 3.2" // TODO test "3" and ".2" too
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.most(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number in [1.2, 2.3]" // TODO test "3" and ".2" too
            });
        });

        it("with an integer", () => {
            var subject = new Autofixture({
                "value" : "integer"
            });
        });

        it("with an integer above a limit", () => {
            var subject = new Autofixture({
                "value" : "integer > 3"
            });
        });

        it("with an integer below a limit", () => {
            var subject = new Autofixture({
                "value" : "integer < 3"
            });
        });

        it("with an integer below a limit", () => {
            var subject = new Autofixture({
                "value" : "integer in [4, 6]"
            });
        });
    });

    describe("creating strings", () => {

        it("with default length", () => {
            var subject = new Autofixture({
                "name" : "string"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.length.of.at.least(1);
        });

        it("with a given length", () => {

            var subject = new Autofixture({
                "name" : "string[5]"
            });
            var value = subject.create(new ClassWithString(""));
            chai.expect(value.name).to.be.a("string");
            chai.expect(value.name).to.have.lengthOf(5);
        });
    });

    describe("handling errors", () => {
        it("of non-existent field specified in autofixture", () => {
            var subject = new Autofixture({
                "wrongName" : "string"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /wrongName/);
        });

        /*
        it("invalid specs", () => {
            chai.expect(() => {
                new Autofixture({
                    "name" : "string[5"
                });
            }).to.throw(Error, /invalid string/);
        });
        */
    });
});
