// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl:'http://localhost:4200',
  // apiBackend:'https://www.uptoschoolworksheets.com'
  // apiBackend:'http://192.168.1.6',
  apiBackend:'http://localhost',
  pathToDeployDir:'',
  firebase:{
    apiKey: "AIzaSyAPInkWwSrhwOE4SMapLb7S5t50Ge_vi7M",
    authDomain: "bookstore-c1f49.firebaseapp.com",
    databaseURL: "https://bookstore-c1f49.firebaseio.com",
    projectId: "bookstore-c1f49",
    storageBucket: "bookstore-c1f49.appspot.com",
    messagingSenderId: "342884727291",
    appId: "1:342884727291:web:2530396bfdccb07f"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
