# PiLit GUI

This is work-in-progress, and as such will require some web developer skills. PiLit GUI is a React app for generating light show sequences for the PiLit system.

You will need a working React development environment in order to use this app. (This [article](https://www.codecademy.com/articles/react-setup-i) might be as good as any to help you get a React environment set up.)

Once installed, you'll need to run `npm install` to download and install the app's dependencies.

Then, run `npm start` to start a development server running this app, which you can access at `http://localhost:1234`.

## Notes

You can use the `-p` flag to specify a port for development. To do this, run `npm start` with an additional flag:

```
npm start -p 3000
```

You can use `npm run build` to create a production build in the `dist` directory. It will have to be run from an HTTP/HTTPS hosted site. (You can't just open the index.html file that is generated.)

## Adding a new node type

You must add the new node type in a couple of place in PiLitGUI. You might need to update the pilit_player.py script as well.

In PiLitGUI:

- Add a new component in the src/components/nodes folder
- Update the `nodeTypes` in the constants.js file
- Add a new thumbnail graphic for the node type in the public/images folder
- Update src/components/channel.js file:
  - Import the graphic and update the nodeTypes const that references those graphics
  - Update `createAnimationsFromImport()` and `handleAddNode()` to create the component

The player script might need updating to handle any specific properties for your new node type.

Of course, you'll need to create the C++ (or other) code for your node as well. See the /nodes folder for current implementations.
