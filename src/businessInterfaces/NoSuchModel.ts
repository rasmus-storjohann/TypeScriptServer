"use strict";

export class NoSuchModel extends Error {
    constructor(public message: string) {
        super(message);
        this.name = "NoSuchModel";
    }
}
