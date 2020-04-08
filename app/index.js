import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { battery, charger } from 'power';
import { today } from 'user-activity';
import * as messaging from "messaging";
import { display } from "display";
import { BodyPresenceSensor } from "body-presence";

// Update the clock every minute
clock.granularity = "seconds";

const currentTime = document.getElementById("currentTime");
const heartRate = document.getElementById("heartRate");
const background = document.getElementById("background");
const textItems = document.getElementsByClassName("contentText");
const currentDate = document.getElementById("currentDate");
const currentDayOfWeek = document.getElementById("currentDayOfWeek");
const batteryLevel = document.getElementById("batteryLevel");
const steps = document.getElementById("steps");
var batteryIcon = document.getElementById("battery");

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

// Rotate the hands every tick
function updateClockHands() {
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);
}

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

  updateClockHands();

  // Update step count
  updateSteps();
}

// Update step count display
function updateSteps() {
  let stepCount = today.adjusted.steps;
  steps.text = `${stepCount}`;
}

// Get battery information and display
function updateBattery() {
  batteryLevel.text = `${battery.chargeLevel}%`;
  if ( charger.connected ) {
    switch(true) {
      case (battery.chargeLevel < 95):
        batteryIcon.href = "battery/battery-status-charging.png";
        break;
      case (battery.chargeLevel >= 95):
        batteryIcon.href = "battery/battery-status-charged.png";
        break;
      default:
        batteryIcon.href = "battery/battery-status-charging.png";
    }
  }
  else if ( !charger.connected ) {
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
        batteryIcon.href = "battery/battery-status-4.png";
        break;
    };
  };
};

battery.onchange = () => {
  updateBattery();
}

// Initialize battery display
updateBattery();

// Get heart rate sensor information and display
if (HeartRateSensor) {
  console.log("This device has a HeartRateSensor!");
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    console.log(`Current heart rate: ${hrm.heartRate}`);
  });
  hrm.start();
} else {
  console.log("This device does NOT have a HeartRateSensor!");
}

if (BodyPresenceSensor) {
  console.log("This device has a BodyPresenceSensor!");
  const bodyPresence = new BodyPresenceSensor();
  bodyPresence.addEventListener("reading", () => {
    console.log(`The device is ${bodyPresence.present ? '' : 'not'} on the user's body.`);
  });
  bodyPresence.start();
} else {
  console.log("This device does NOT have a BodyPresenceSensor!");
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

