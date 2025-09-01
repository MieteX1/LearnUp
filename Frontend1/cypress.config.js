import { defineConfig } from "cypress";

export default defineConfig({
  env:{
    MAILISK_API_KEY:'R_4mr23Pxb9VnAW78TQZTwCVUi24mSlvq-h34zqDes8',
    MAILISK_NAMESPACE:'ju00x4747v0n',
    USER_EMAIL:'Test321@ju00x4747v0n.mailisk.net',
    PASSWORD:'Qwerty12#4',
  },
  e2e: {
    baseUrl: "http://localhost:5173",
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
