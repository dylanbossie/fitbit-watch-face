import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { battery, charger } from 'power';
import { today } from 'user-activity';
import * as messaging from "messaging";

// Update the clock every minute
clock.granularity = "seconds";

const currentTime = document.getElementById("currentTime");
const heartRate = document.getElementById("heartRate");
const background = document.getElementById("background");
const textItems = document.getElementsByClassName("contentText");
const currentDate = document.getElementById("currentDate");
const currentDayOfWeek = document.getElementById("currentDayOfWeek");
const batteryLevel = document.getElementById("batteryLevel");
var batteryIcon = document.getElementById("battery");

let dayOfWeekMap = new Map;
dayOfWeekMap.set(0, "Sun");
dayOfWeekMap.set(1, "Mon");
dayOfWeekMap.set(2, "Tue");
dayOfWeekMap.set(3, "Wed");
dayOfWeekMap.set(4, "Thu");
dayOfWeekMap.set(5, "Fri");
dayOfWeekMap.set(6, "Sat");

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
  // Get day and time information from tickEvent
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

  // Format date information and display
  currentDate.text = `${month+1}/${day}`;
  currentDayOfWeek.text = `${dayOfWeekMap.get(dayOfWeek)}`;
}

// Get battery information and display
battery.onchange = (charger, evt) => {
  batteryLevel.text = `${battery.chargeLevel}%`;
  switch(true) {
    case (battery.chargeLevel <= 20):
      batteryIcon.href = "battery/battery-status-1.png";
      break;
    case (battery.chargeLevel > 20 && battery.chargeLevel <= 50):
      batteryIcon.href = "battery/battery-status-2.png";
      break;
    case (battery.chargeLevel > 50 && battery.chargeLevel <= 80):
      batteryIcon.href = "battery/battery-status-3.png";
      break;
    case (battery.chargeLevel > 80):
      batteryIcon.href = "battery/battery-status-4.png";
      break;
    default:
      batteryIcon.href = "battery/battery-status-charged.png";
      break;
  }
}

// Get heart rate sensor information and display
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

console.log("The charger " + (charger.connected ? "is" : "is not ") + " connected");
console.log(`${today.adjusted.steps} steps today`);

