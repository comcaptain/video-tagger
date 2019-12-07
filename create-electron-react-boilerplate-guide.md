### TO READ LIST
- [Creating a React App… From Scratch.](https://blog.usejournal.com/creating-a-react-app-from-scratch-f3c693b84658)

### Read list
- [Tutorial: Intro to React](https://reactjs.org/tutorial/tutorial.html)
- [Create Your First React Desktop Application in Electron with Hot-Reload](https://dev.to/jsmanifest/create-your-first-react-desktop-application-in-electron-with-hot-reload-4jj5) Unluckily, this does not work if html's referenced js invokes nodejs/electron api...
- [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) This also failed with some errors...
- [How to build an Electron app using Create React App and Electron Builder](https://www.codementor.io/randyfindley/how-to-build-an-electron-app-using-create-react-app-and-electron-builder-ss1k0sfer)

### Final tutorial

This tutorial comes from [How to build an Electron app using Create React App and Electron Builder](https://www.codementor.io/randyfindley/how-to-build-an-electron-app-using-create-react-app-and-electron-builder-ss1k0sfer) but has some changes to fix some issues

**1. Create new app using Create React App**

```bash
npx create-react-app my-app
cd my-app
```

**2. Add electron dependency**

```bash
yarn add electron electron-builder --dev
```

**3. Add some more tools that would be used**

```bash
yarn add wait-on concurrently --dev
yarn add electron-is-dev
```

**4. Create main js for electron**

Create a new file, `public/electron.js`, with the following contents.

```javascript
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({width: 900, height: 680, webPreferences: {
    nodeIntegration: true
  }});
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  if (isDev) {
    // Open the DevTools.
    //BrowserWindow.addDevToolsExtension('<location to your react chrome extension>');
    mainWindow.webContents.openDevTools();
  }
  mainWindow.on('closed', () => mainWindow = null);
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

Then add the following `main` tag to package.json to tell electron this is the entry point

```json
"main": "public/electron.js"
```

**5. Add `electron-dev` scripts**

Run `yarn add cross-env --dev` so that setting variable would work in Windows

```json
"electron-dev": "concurrently \"cross-env BROWSER=none yarn start\" \"wait-on http://localhost:3000 && electron .\""
```

**6. Add support for nodejs/electron in js referenced in html**

To solve this we need to use the `electron-renderer` as the Webpack target... but we don't want to eject CRA to do it. So we use Rescripts

First, install Rescripts.

```bash
yarn add @rescripts/cli @rescripts/rescript-env --dev
```

Then, change the scripts tags in package.json from this...

```json
"start": "react-scripts start",
"build": "react-scripts build",
"test": "react-scripts test",
```

to this:

```json
"start": "rescripts start",
"build": "rescripts build",
"test": "rescripts test",
```

Now add a new file in app's root directory called `.rescriptsrc.js` with the following contents:

```javascript
module.exports = [require.resolve('./.webpack.config.js')]
```

Now add a new file in app's root directory called `.webpack.config.js` with the following contents:

```javascript
// define child rescript
module.exports = config => {
  config.target = 'electron-renderer';
  return config;
}
```

You can start your app with `yarn electron-dev`

**7. Add package setup**

First, add Electron Builder & Typescript:

```bash
yarn add electron-builder typescript --dev
```

CRA, by default, builds an index.html that uses absolute paths. This will fail when loading it in Electron. There is a config option to change this.

Set the homepage property in `package.json`.

```json
"homepage": "./",
```

Next lets add the new `electron-pack` command which will package the builds.

Add the following to the scripts tag in package.json.

```json
"postinstall": "electron-builder install-app-deps",
"preelectron-pack": "yarn build",
"electron-pack": "electron-builder -w"
```

`"postinstall": "electron-builder install-app-deps"` will ensure that your native dependencies always match the electron version.

`"preelectron-pack": "yarn build"` will build the CRA.

`"electron-pack": "build -w"` packages the app for Windows (w), if you want to build one for mac change it to `-m`. `-m` only works on mac, not windows

Before we can run this command we have to configure Electron Builder.

Add the following to package.json.

```json
"author": {
  "name": "Your Name",
  "email": "your.email@domain.com",
  "url": "https://your-website.com"
},
"build": {
  "appId": "com.my-website.my-app",
  "productName": "MyApp",
  "copyright": "Copyright © 2019 ${author}",
  "mac": {
    "category": "public.app-category.utilities"
  },
  "files": [
    "build/**/*",
    "node_modules/**/*"
  ],
  "directories": {
    "buildResources": "assets"
  }
}
```

Run `yarn electron-pack` to build the installer (**BE SURE TO turn off 火绒 before doing this!**), built exe file would be in dist directory.
