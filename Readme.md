# ElectronAngular

This sample application demonstrate how to create a desktop application using Angular JS and Github Electron.



#Install
---

Install dependencies.

```
	npm install
```

Install bower dependencies

```
	bower install
```

Install Application dependencies:

Change directory to ```app``` folder, then run

```
npm install
```

#Add Sqlite supports
---
```
npm config set msvs_version 2014 --global
npm install --save-dev electron-rebuild
# Every time you run npm install, run this
./node_modules/.bin/electron-rebuild
```


#Run
---

Run your application by entering following command in your command prompt

```
	gulp run
```

#Release
---

You can get the release version with following command:

```
gulp build-electron
```
