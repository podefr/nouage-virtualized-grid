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

describe("Given Nouage, a SeamView, an observed array", function () {

    var nouage = null,
        seamView = null,
        model;

    beforeEach(function () {
        // The object that we want to data bind to, also called the model
        model = [{
            firstname: "Data1",
            lastname: "Binding1",
            email: {
                main: "work@email.com1"
            }
        }, {
            firstname: "Data2",
            lastname: "Binding2",
            email: {
                main: "work@email.com2"
            }
        }, {
            firstname: "Data3",
            lastname: "Binding3",
            email: {
                main: "work@email.com3"
            }
        }];
        // Then we create the data-binding plugin that will bind the object with the DOM
        nouage = new Nouage(model);
        // And we add it to seam, which is our declarative way to add behavior to the DOM
        seamView = new SeamView();
        seamView.seam.addAll({
            "bind": nouage
        });
    });

    describe("And an html view with bindings", function () {

        var view = '<ul data-bind="foreach">' +
                '<li>' +
                    '<span data-bind="bind:innerHTML, firstname"></span>' +
                    '<span data-bind="bind:innerHTML, lastname"></span>' +
                    '<span data-bind="bind:innerHTML, email.main"></span>' +
                '</li>' +
            '</ul>';

        describe("When applying nouage", function () {
            var dom;
            beforeEach(function () {
                seamView.template = view;
                seamView.render();
                dom = seamView.dom;
            });

            it("Then the view receives the model's data", function (done) {
                setImmediate(function () {
                    var firstLi = dom.querySelectorAll("li")[0];
                    expect(firstLi.querySelectorAll("span")[0].innerHTML).to.equal("Data1");
                    expect(firstLi.querySelectorAll("span")[1].innerHTML).to.equal("Binding1");
                    expect(firstLi.querySelectorAll("span")[2].innerHTML).to.equal("work@email.com1");

                    var secondLi = dom.querySelectorAll("li")[1];
                    expect(secondLi.querySelectorAll("span")[0].innerHTML).to.equal("Data2");
                    expect(secondLi.querySelectorAll("span")[1].innerHTML).to.equal("Binding2");
                    expect(secondLi.querySelectorAll("span")[2].innerHTML).to.equal("work@email.com2");

                    var thirdLi = dom.querySelectorAll("li")[2];
                    expect(thirdLi.querySelectorAll("span")[0].innerHTML).to.equal("Data3");
                    expect(thirdLi.querySelectorAll("span")[1].innerHTML).to.equal("Binding3");
                    expect(thirdLi.querySelectorAll("span")[2].innerHTML).to.equal("work@email.com3");
                    done();
                });
            });

            describe("When properties are updated", function () {
                beforeEach(function () {
                    model[0].firstname = "new Data1";
                    model[2].email.main = "new work@email.com3";
                });

                it("Then updates the view with the new data", function (done) {
                    setImmediate(function () {
                        var firstLi = dom.querySelectorAll("li")[0];
                        expect(firstLi.querySelectorAll("span")[0].innerHTML).to.equal("new Data1");

                        var thirdLi = dom.querySelectorAll("li")[2];
                        expect(thirdLi.querySelectorAll("span")[2].innerHTML).to.equal("new work@email.com3");
                        done();
                    });
                });
            });

            describe("When an item is removed from the model", function () {
                beforeEach(function () {
                    model.splice(1, 1);
                });

                it("Then removes the item from the view", function (done) {
                    setImmediate(function () {
                        expect(dom.querySelectorAll("li").length).to.equal(2);

                        var firstLi = dom.querySelectorAll("li")[0];
                        expect(firstLi.querySelectorAll("span")[0].innerHTML).to.equal("Data1");
                        expect(firstLi.querySelectorAll("span")[1].innerHTML).to.equal("Binding1");
                        expect(firstLi.querySelectorAll("span")[2].innerHTML).to.equal("work@email.com1");

                        var secondLi = dom.querySelectorAll("li")[1];
                        expect(secondLi.querySelectorAll("span")[0].innerHTML).to.equal("Data3");
                        expect(secondLi.querySelectorAll("span")[1].innerHTML).to.equal("Binding3");
                        expect(secondLi.querySelectorAll("span")[2].innerHTML).to.equal("work@email.com3");
                        done();
                    });
                });
            });

            describe("When several items are removed from the model", function () {
                beforeEach(function () {
                    model.length = 0;
                });

                it("Then removes all items from the view", function (done) {
                    setImmediate(function () {
                        expect(dom.querySelectorAll("li").length).to.equal(0);
                        done();
                    });
                });
            });

            describe("When sparse items are removed from the model", function () {
                beforeEach(function () {
                    model.splice(0, 1);
                    model.pop();
                });

                it("Then removes the items from the view", function (done) {
                    setTimeout(function () {
                        expect(dom.querySelectorAll("li").length).to.equal(1);
                        var firstLi = dom.querySelectorAll("li")[0];
                        expect(firstLi.querySelectorAll("span")[0].innerHTML).to.equal("Data2");
                        expect(firstLi.querySelectorAll("span")[1].innerHTML).to.equal("Binding2");
                        expect(firstLi.querySelectorAll("span")[2].innerHTML).to.equal("work@email.com2");
                        done();
                    }, 0);
                });
            });
        });
    });
});