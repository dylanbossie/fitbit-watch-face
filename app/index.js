import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { battery, charger } from 'power';
import { today } from 'user-activity';
import * as messaging from "messaging";

// Update the clock every minute
clock.granularity = "minutes";

const currentTime = document.getElementById("currentTime");
const heartRate = document.getElementById("heartRate");
const background = document.getElementById("background");
const textItems = document.getElementsByClassName("contentText");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  // Get date and time information
  let today = evt.date;
  let dayOfWeek = today.getDay();
  let day = today.getDate();
  let month = today.getMonth();
  
  // Format time information and assign to currentTime for final display
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  currentTime.text = `${hours}:${mins}`;
}

if (HeartRateSensor) {
   const hrm = new HeartRateSensor();
   hrm.addEventListener("reading", () => {
     console.log(`Current heart rate: ${hrm.heartRate}`);
     let heart = hrm.heartRate;
     heartRate.text = `${heart}`;
   });
   hrm.start();
}

// Receive settings updates from companion and apply changes
messaging.peerSocket.onmessage = (evt,today) => {
  switch(evt.data.key) {
  case "clockTextColor":
    for (let item = 0; item < textItems.length; item++) {
      textItems[item].style.fill = evt.data.value;
    }
    break;
  default:
    console.log(["Invalid settings option passed: " + evt.data.key]);
  }
};

console.log(Math.floor(battery.chargeLevel) + "%");
console.log("The charger " + (charger.connected ? "is" : "is not ") + " connected");
console.log(`${today.adjusted.steps} steps today`);

