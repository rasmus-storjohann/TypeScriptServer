// can create integers
// can set a random number provider
// can use a function as spec for a field, which is passed in the autofixture
// exposes static functions for string, number and bool creation
// nested object support
// don't modify argument object
// objects with arrays as properties, hmmm

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

    public createMany<T extends Object>(t: T, count = 3) : T[] {
        var results = new Array<T>();
        for (var i = 0; i < count; i++) {
            results.push(this.create(t));
        }
        return results;
    }

    public create<T extends Object>(template: T) : T {

        this.throwIfOptionsContainsFieldsNotIn(template);

        var result = Object.assign({}, template);

        this.iterate(result, (name, value) => {
            var type = typeof result[name];

            if (this.optionsContain(name)) {
                result[name] = this.generateFromOption(name, type);
            } else if (this.isTypeSupported(type)) {
                result[name] = this.generateFromSpec(type);
            } else {
                this.throwUnsupportedTypeError(type);
            }
        });
        return result;
    }

    private throwIfOptionsContainsFieldsNotIn<T>(t: T) {
        this.iterate(this.options, (name, value) => {
            if (!t.hasOwnProperty(name)) {
                throw Error("Autofixture specifies field '" + name + "' that is not in the type");
            }
        });
    }

    // Object.keys is better
    private iterate(object, callback) {
        for (var property in object) {
            if (object.hasOwnProperty(property)) {
                callback(property, object[property]);
            }
        }
    }

    private optionsContain(name: string) {
        return this.options && this.options.hasOwnProperty(name);
    }

    private generateFromOption(name: string, type: string) {
        this.throwOnIncompatibleSpec(type, this.options[name]);

        return this.generateFromSpec(this.options[name]);
    }

    private throwOnIncompatibleSpec(type: string, spec: string) {
        var booleanOk = type === "boolean" && spec === "boolean";
        var stringOk = type === "string" && /^string/.test(spec);
        var numberOk = type === "number" && /^number/.test(spec);

        if (!booleanOk && !stringOk && !numberOk) {
            throw Error("AutoFixture spec '" + spec + "' not compatible with type '" + type + "'");
        }
    }

    private isTypeSupported(type: string) {
        return type === "boolean" || type === "string" || type === "number";
    }

    private throwUnsupportedTypeError(type: string) {
        throw Error("Autofixture cannot generate values of type '" + name + "'");
    }

    private generateFromSpec(spec: string) {
        if (spec === "boolean") {
            return this.generateBoolean();
        }
        if (/^string.*/.test(spec)) {
            return this.generateString(spec);
        }
        if (/^number.*/.test(spec)) {
            return this.generateNumber(spec);
        }
        throw new Error("invalid type in autofixture spec '" + spec + "'");
    }

    private generateBoolean() {
        return this.random() > 0.5;
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
        throw new Error("Invalid string autofixture spec: " + spec);
    }

    private generateNumber(spec: string) {
        if (spec === "number") {
            return this.random();
        }

        var atLeast = /^number\s*\>\s*(\d*\.?\d+)$/.exec(spec);
        if (atLeast) {
            var limit = parseFloat(atLeast[1]);
            return limit + this.random();
        }

        var atMost = /^number\s*\<\s*(\d*\.?\d+)$/.exec(spec);
        if (atMost) {
            var limit = parseFloat(atMost[1]);
            return limit - 1 + this.random();
        }

        var inRange = /^number in \<(\d*\.?\d+),(\d*\.?\d+)\>$/.exec(spec);
        if (inRange) {
            var min = parseFloat(inRange[1]);
            var max = parseFloat(inRange[2]);
            return min + (max - min) * this.random();
        }

        throw new Error("invalid number autofixture spec");
    }

    private random() {
        return Math.random();
    }
};

describe("Autofixture", () => {

    class ClassWithBoolean {
        public flag: boolean;
        constructor(flag: boolean) {
            this.flag = flag;
        }
    }

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
        public flag: boolean;
        public value: number;
        public name: string;
        constructor() {
            this.flag = true;
            this.name = "";
            this.value = 1;
        }
    };

    it("can create from implicit spec", () => {
        var subject = new Autofixture();
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.flag).to.be.a("boolean");
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.name).to.be.a("string");
    });

    it("can create from partial spec", () => {
        var subject = new Autofixture({
            "value" : "number > 5"
        });
        var value = subject.create(new ClassWithEverything());
        chai.expect(value.value).to.be.a("number");
        chai.expect(value.value).to.be.at.least(5);
        chai.expect(value.name).to.be.a("string");
        chai.expect(value.name).to.have.length.of.at.least(1);
    });

    it("does not modify argument object", () => {
        var subject = new Autofixture();

        var argumentObject = new ClassWithEverything();
        argumentObject.flag = false;
        argumentObject.name = "name";
        argumentObject.value = 1;

        subject.create(argumentObject);

        chai.expect(argumentObject.flag).to.equal(false);
        chai.expect(argumentObject.name).to.equal("name");
        chai.expect(argumentObject.value).to.equal(1);
    });

    describe("can create many", () => {
        var value;

        beforeEach(() => {
            var subject = new Autofixture();
            value = subject.createMany(new ClassWithEverything());
        });

        it("returns an array of several elements", () => {
            chai.expect(value).to.be.instanceOf(Array);
            chai.expect(value).to.have.length.above(1);
        });

        it("returns an array of the expected type", () => {
            chai.expect(value[0]).to.be.instanceOf(Object);
            chai.expect(value[0].flag).to.be.a("boolean");
            chai.expect(value[0].value).to.be.a("number");
            chai.expect(value[0].name).to.be.a("string");
        });

        it("returns an array of unique values", () => {
            chai.expect(value[0].value).to.not.equal(value[1].value);
            chai.expect(value[0].name).to.not.equal(value[1].name);
        });
    });

    describe("creating booleans", () => {
        it("with any value", () => {
            var subject = new Autofixture({
                "flag" : "boolean"
            });
            var value = subject.create(new ClassWithBoolean(true));
            chai.expect(value.flag).to.be.a("boolean");
        });
    });

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
                "value" : "number > 3.2"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number < 3.2"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.most(3.2);
        });

        it("with a value below a limit", () => {
            var subject = new Autofixture({
                "value" : "number in <1.2,2.3>"
            });
            var value = subject.create(new ClassWithNumber(0));
            chai.expect(value.value).to.be.a("number");
            chai.expect(value.value).to.be.at.least(1.2);
            chai.expect(value.value).to.be.at.most(2.3);
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
                "value" : "integer in <4,6>"
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
        it("of misspelled field", () => {
            var subject = new Autofixture({
                "mane" : "string"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /field \'mane\' that is not in the type/);
        });

        it("on wrong type in spec", () => {
            var subject = new Autofixture({
                "name" : "number"
            });
            chai.expect(() => {
                subject.create(new ClassWithString(""));
            }).to.throw(Error, /\'number\' not compatible with type \'string\'/);
        });

        /*
        // valid: string [ 5 ], "number in < 5.1 , 6.1 >", "number < 2", "number < .2"
        // invalid: sting, string[5, string[],
        it("invalid specs", () => {
            chai.expect(() => {
                new Autofixture({
                    "name" : "string[5]"
                });
            }).to.throw(Error);
        });
        */
    });
});
