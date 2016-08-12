"use strict";

export class ValidationError {
    private message: string;
    constructor(message: string) {
        this.message = message;
    }
    public getMessage() {
        return this.message;
    }
};
