/**
 * @license nouage https://github.com/podefr/nouage
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2015 Olivier Scherrer <pode.fr@gmail.com>
 */
"use strict";

require("quick-dom");

var expect = require("chai").expect;

GLOBAL.SVGElement = document.createElementNS("http://www.w3.org/2000/svg", "ellipse").constructor;
GLOBAL.HTMLElement = document.body.constructor;

var Nouage = require("../index"),
    SeamView = require("seam-view");

function sendKeys(input, text) {
    input.value = text;
    // couldn't get the change event to fire otherwise
    input._listeners.change.true.forEach(function (handler) {
        handler();
    });
}

describe("Given Nouage, a SeamView, an observed object", function () {

    var nouage = null,
        seamView = null,
        model;

    beforeEach(function () {
        // The object that we want to data bind to, also called the model
        model = {
            firstname: "Data"
        };
        // Then we create the data-binding plugin that will bind the object with the DOM
        nouage = new Nouage(model);
        // And we add it to seam, which is our declarative way to add behavior to the DOM
        seamView = new SeamView();
        seamView.seam.addAll({
            "bind": nouage
        });
    });

    describe("And an html view with bindings", function () {

        var view = '<form>' +
            '<input type="text" data-bind="bind:value, firstname"></span>' +
        '</form>';

        describe("When applying nouage", function () {
            var dom;

            beforeEach(function () {
                seamView.template = view;
                seamView.render();
                dom = seamView.dom;
            });

            it("Then sets the value into the input field", function (done) {
                setImmediate(function () {
                    expect(dom.querySelector("input").value).to.equal("Data");
                    done();
                });
            });

            describe("When changing the value of the input field", function () {
                beforeEach(function () {
                    sendKeys(dom.querySelector("input"), "Bindings");
                });

                it("Then sets the value into the model", function (done) {
                    setImmediate(function () {
                        expect(model.firstname).to.equal("Bindings");
                        done();
                    });
                });
            });
        });
    });

    describe("And an html view with deeply nested bindings", function () {

        var view = '<form>' +
            '<input type="text" data-bind="bind:value, phone.work.0"></span>' +
            '</form>';

        describe("When applying nouage", function () {
            var dom;

            beforeEach(function () {
                seamView.template = view;
                seamView.render();
                dom = seamView.dom;

                model.phone = {
                    work: [ 123 ]
                };
            });

            it("Then sets the value into the input field", function (done) {
                setImmediate(function () {
                    expect(dom.querySelector("input").value).to.equal("123");
                    done();
                });
            });

            describe("When changing the value of the input field", function () {
                beforeEach(function () {
                    sendKeys(dom.querySelector("input"), "3210");
                });

                it("Then sets the value into the model", function (done) {
                    setImmediate(function () {
                        expect(model.phone.work[0]).to.equal("3210");
                        done();
                    });
                });
            });
        });
    });

});