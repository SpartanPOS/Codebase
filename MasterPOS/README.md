This is a base point of sale and for now has zero features
I am in the process of implementing ways to have a modular runtime

The  main thread handles the security. When properly authenticated as both an employee and authenticating the device for the business the server will dynamically load modules from the ``\runtime`` folder.

in the ``runtime`` folder there is an index.json that catalogs the packages and sorts the types of packages. ``viewModules`` will describe modules that have react components to offer, within each view module there is a ``spartanPOS.viewExports`` array that lists the files that are available to view.

This is project is entirely a work in progress and there is no gurantee for its security or functionality.