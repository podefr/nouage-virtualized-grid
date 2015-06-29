(function main() {
	var Seam = require("Seam"),
		Nouage = require("nouage");

	// The view we want to attach behavior to
	var view = document.querySelector(".container");

	// Create the observable-store with 1M items
	window.model = getData(1000);

	window.createItem = createItem;

	// Create the data-binding plugin with the new store
	var nouage = getInitNouage(window.model);

	// Create Seam with the data-binding plugin
	var seam = getInitSeam(nouage);

	// Apply Seam to the template
	seam.apply(view);

	// Bind the scroll events and the data-binding plugin to update
	// the viewport
	bindScrollEvents(view, nouage);

	function createItem(id) {

		function pick(array) {
			return array[Math.floor(Math.random() * array.length)]
		}

		return {
			"id" : id,
			"continent": pick(["North America", "Europe", "South America", "Africa", "Antartica", "Australia", "Asia"]),
			"color": pick(["yellow", "red", "lightblue"]),
			"quantity1": Math.floor(Math.random() * 100000),
			"quantity2": Math.floor(Math.random() * 100000),
			"quantity3": Math.floor(Math.random() * 100000),
			"quantity4": Math.floor(Math.random() * 100000),
			"date": (new Date().getTime()),
			"fruit": pick(["banana", "apple", "pear"]),
			"name": pick(["olivier", "pierre", "lucien"])
		};
	}


	function getData(count) {
		var data = [];

		for (var i=0; i<=count; i++) {
			data.push(createItem(i));
		}

		return data;
	}

	function getInitNouage(model) {
		return new Nouage(model, {
			formatDate: function (timestamp) {
				this.innerHTML = new Date(timestamp).toISOString();
			}
		});
	}

	function getInitSeam(bindPlugin) {
		var seam = new Seam();
		seam.addAll({
			"model": bindPlugin
		});
		return seam;
	}

	function bindScrollEvents(view, bind) {
		function move(idx) {
			var itemRenderer = bind.getItemRenderer("list");
			itemRenderer.setStart(idx);
			itemRenderer.render();
		}

		function moveToIndex() {
			move(Math.floor(this.scrollTop / 20));
		}

		view.addEventListener("scroll", moveToIndex);
	}

})();
