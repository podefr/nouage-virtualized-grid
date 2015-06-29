#An example of a virtualized Grid using Seam's _nouage_ plugin

This demo is the same as the [1M virtualized grid](https://github.com/podefr/data-binding-virtualized-grid), except that it's based on _nouage_, which is a data-binding plugin based on Object.observe.

### The html for generating the grid

```html
<table>
	<thead>
		<tr>
			<td>#ID</td>
			<td>Continent</td>
			<td>Color</td>
			<td>Quantity</td>
			<td>Quantity</td>
			<td>Quantity</td>
			<td>Quantity</td>
			<td>Date</td>
			<td>fruit</td>
			<td>name</td>
		</tr>
	</thead>
	<tbody data-model="foreach: list,0,20">
		<tr>
			<td data-model="bind: innerHTML, id"></td>
			<td data-model="bind: innerHTML, continent"></td>
			<td data-model="bind: innerHTML, color"></td>
			<td data-model="bind: innerHTML, quantity1"></td>
			<td data-model="bind: innerHTML, quantity2"></td>
			<td data-model="bind: innerHTML, quantity3"></td>
			<td data-model="bind: innerHTML, quantity4"></td>
			<td data-model="bind: formatDate, date"></td>
			<td data-model="bind: innerHTML, fruit"></td>
			<td data-model="bind: innerHTML, name"></td>
		</tr>
	</tbody>
</table>
```

### The 100,000 rows

```js
for (; i<=100000; i++) {
	data.push({
		"id" : i,
		"continent": pick(["North America", "Europe", "South America", "Africa", "Antartica", "Australia", "Asia"]),
		"color": pick(["yellow", "red", "lightblue"]),
		"quantity1": Math.floor(Math.random() * 100000),
		"quantity2": Math.floor(Math.random() * 100000),
		"quantity3": Math.floor(Math.random() * 100000),
		"quantity4": Math.floor(Math.random() * 100000),
		"date": (new Date().getTime()),
		"fruit": pick(["banana", "apple", "pear"]),
		"name": pick(["olivier", "pierre", "lucien"])
	});
}
```

### The js for applying the data to the HTML

Most of the cells are assigned the value via the innerHTML property, but the data has it's own formatter which is shown here

```js
// The view we want to attach behavior to
var view = document.querySelector(".container");

// Create the observable-store with 100k items.
// We add a reference to the global object so that we can demo the feature in the console
// by directly modifying the model
window.model = getData(100000);

// Create the data-binding plugin with the new store
var nouage = getInitNouage(window.model);

// Create Seam with the data-binding plugin
var seam = getInitSeam(nouage);

// Apply Seam to the template
seam.apply(view);
```

How we create the 100k items array:

```js
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
```

How we initialize the nouage plugin

```js
function getInitNouage(model) {
	return new Nouage(model, {
		formatDate: function (timestamp) {
			this.innerHTML = new Date(timestamp).toISOString();
		}
	});
}
```

How we initialize seam:

```js
function getInitSeam(bindPlugin) {
	var seam = new Seam();
	seam.addAll({
		"model": bindPlugin
	});
	return seam;
}
```
