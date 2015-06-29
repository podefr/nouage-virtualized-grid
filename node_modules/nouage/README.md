Disclaimer: this is a WIP, nothing's actually working for now

Nouage.js
-----------------

Nouage is a French translation for the word _binding_.

Now that Object.observe starts being available in various JS runtimes, data-binding libraries can be standalone. For years, we have used Backbone-like models that publish events when changes happen, or Angular-like digest loops with dirty-checking.
These were necessary complications to achieve data-binding in the browser as JavaScript didn't have any official way to watch for changes in data structures, until Object.obsreve.
Nouage is a library that leverages Object.observe to provide a way to achieve two-way data-binding.

Note that if you're into immutable data structure, this isn't for you ;)

Installation
---------

npm install nouage

Usage
-----

var nouage = require('nouage');

License
-----

MIT