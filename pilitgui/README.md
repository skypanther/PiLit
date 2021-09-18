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
