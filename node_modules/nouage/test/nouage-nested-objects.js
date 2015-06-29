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

        var view = '<div>' +
            '<span data-bind="bind:innerHTML, firstname"></span>' +
            '<span data-bind="bind:innerHTML, lastname"></span>' +
            '<span data-bind="bind:innerHTML, phone"></span>' +
            '<span data-bind="bind:innerHTML, email.work.main"></span>' +
            '</div>';

        describe("When applying nouage", function () {
            var dom;
            beforeEach(function () {
                seamView.template = view;
                seamView.render();
                dom = seamView.dom;
            });

            it("Then the view receives the model's data", function (done) {
                setImmediate(function () {
                    expect(dom.querySelectorAll("span")[0].innerHTML).to.equal("Data");
                    expect(dom.querySelectorAll("span")[1].innerHTML).to.equal("");
                    expect(dom.querySelectorAll("span")[2].innerHTML).to.equal("");
                    done();
                });
            });

            describe("When properties are updated", function () {
                beforeEach(function () {
                    model.lastname = "Binding";
                });

                it("Then the view receives the model's data", function (done) {
                    setImmediate(function () {
                        expect(dom.querySelectorAll("span")[0].innerHTML).to.equal("Data");
                        expect(dom.querySelectorAll("span")[1].innerHTML).to.equal("Binding");
                        done();
                    });
                });
            });

            describe("When properties are deleted", function () {
               beforeEach(function () {
                   delete model.firstname;
               });

                it("Then the view is updated", function (done) {
                    setImmediate(function () {
                        expect(dom.querySelectorAll("span")[0].innerHTML).to.equal("");
                        done();
                    });
                });

                describe("When properties are added back", function () {
                    beforeEach(function () {
                        model.firstname = "DataBack";
                    });

                    it("Then updates the dom again", function (done) {
                        setImmediate(function () {
                            expect(dom.querySelectorAll("span")[0].innerHTML).to.equal("DataBack");
                            done();
                        });
                    });
                });
            });

            describe("When properties are added", function () {
                beforeEach(function () {
                    model.phone = "123-456-7890";
                });

                it("Then the view is updated", function (done) {
                    setImmediate(function () {
                        expect(dom.querySelectorAll("span")[2].innerHTML).to.equal("123-456-7890");
                        done();
                    });
                });
            });

            describe("When properties are nested", function () {
                beforeEach(function () {
                    model.email = {
                        work: {
                            main: "work@email.com"
                        }
                    };
                });

                it("Then the view is updated", function (done) {
                    setImmediate(function () {
                        expect(dom.querySelectorAll("span")[3].innerHTML).to.equal("work@email.com");
                        done();
                    });
                });

                describe("When the property is updated", function () {
                    beforeEach(function () {
                        model.email.work.main = "new-work@email.com";
                    });

                    it("Then updates the view", function (done) {
                        setImmediate(function () {
                            expect(dom.querySelectorAll("span")[3].innerHTML).to.equal("new-work@email.com");
                            done();
                        });
                    });
                });

                describe("When the property is deleted", function () {
                    beforeEach(function () {
                        delete model.email.work.main;
                    });

                    it("Then updates the view", function (done) {
                        setImmediate(function () {
                            expect(dom.querySelectorAll("span")[3].innerHTML).to.equal("");
                            done();
                        });
                    });

                    describe("And added back", function () {
                        beforeEach(function () {
                            model.email.work.main = "new-work@email.com";
                        });

                        it("Then updates the view again", function (done) {
                            setImmediate(function () {
                                expect(dom.querySelectorAll("span")[3].innerHTML).to.equal("new-work@email.com");
                                done();
                            });
                        });
                    });
                });

                describe("When a parent property is deleted", function () {
                    beforeEach(function () {
                        delete model.email;
                    });

                    it("Then updates the view", function (done) {
                        setImmediate(function () {
                            expect(dom.querySelectorAll("span")[3].innerHTML).to.equal("");
                            done();
                        });
                    });

                    describe("And added back", function () {
                        beforeEach(function () {
                            model.email = {
                                work: {
                                    main: "new-work@email.com"
                                }
                            };
                        });

                        it("Then updates the view again", function (done) {
                            setImmediate(function () {
                                expect(dom.querySelectorAll("span")[3].innerHTML).to.equal("new-work@email.com");
                                done();
                            });
                        });
                    });
                });
            });
        });

    });

});