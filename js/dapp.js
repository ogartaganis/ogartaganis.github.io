const ssABI = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "LogFailure",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "message",
				"type": "string"
			}
		],
		"name": "LogSuccess",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newVerifier",
				"type": "address"
			}
		],
		"name": "addVerifier",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "vaccineSerialNumber",
				"type": "string"
			}
		],
		"name": "registerVaccinatedPerson",
		"outputs": [
			{
				"internalType": "string",
				"name": "qrCode",
				"type": "string"
			}
		],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address[]",
				"name": "_verifiers",
				"type": "address[]"
			},
			{
				"internalType": "string[]",
				"name": "_legitVaccineSerialNumbers",
				"type": "string[]"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "numberOfSerialsLeft",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "count",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "verifiers",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "serialNumber",
				"type": "string"
			}
		],
		"name": "verifyRegisteredPerson",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
const ssAddress = '0x4cef6B0c07C4232091f347Fbe9724A3366e131d4';

// 1. detect Metamask is/is not installed
window.addEventListener('load', function() {
    if (typeof window.ethereum !== 'undefined'){
        console.log('asdfff MetaMask detected!')
        // document refers to the html file
        let mmDetected = document.getElementById('mm-detected')
        mmDetected.innerHTML = "MetaMask Has Been Detected!"
    } else {
        console.group('MetaMask Not Available!')
        alert("You need to install MetaMask or another wallet!")
    }
})

const mmEnable = document.getElementById('mm-connect');

// 2. allow the user to get access to Metamask3.
mmEnable.onclick = async() => {
    console.log("asdfff about to scan")
    await ethereum.request({ method: 'eth_requestAccounts'})

    const mmCurrentAccount = document.getElementById('mm-current-account');
    mmEnable.style.visibility='hidden';

    mmCurrentAccount.innerHTML = "Here's your current account: <br />"+ethereum.selectedAddress

	updateSerialNumbersLeft();
}

function openRole(evt, role) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(role).style.display = "block";
    evt.currentTarget.className += " active";
  } 

// *********************************** //
// ************* Scanner ************* //
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Code scanned = ${decodedText}`, decodedResult);
  html5QrcodeScanner.stop();
  
  QRCode.stop;
}

async function updateSerialNumbersLeft() {
	const ssSerialNumbersLeft = document.getElementById("ss-serial-numbers-left")
	const resultName = await vaccinatorContract.methods.numberOfSerialsLeft().call({from: ethereum.selectedAddress});
	ssSerialNumbersLeft.innerHTML = "Legit serial numbers still left: " + resultName
}

// PRO mode
const html5QrCode = new Html5Qrcode("qr-reader");
// This method will trigger user permissions
var cameraId = "";
Html5Qrcode.getCameras().then(devices => {
  /**
   * devices would be an array of objects of type:
   * { id: "id", label: "label" }
   */
  if (devices && devices.length) {
    cameraId = devices[0].id;
    console.log("CAMERA ID: "+cameraId);
  }
}).catch(err => {
  // handle err
});
const startScanning = document.getElementById('qr-start-scanning');

// VERIFY -> SCAN!
startScanning.onclick = async() => {
	startScanning.style.visibility='hidden';
    html5QrCode.start(
        cameraId, 
        {
          fps: 10,    // Optional, frame per seconds for qr code scanning
          qrbox: { width: 250, height: 250 }  // Optional, if you want bounded box UI
        },
        async(decodedText, decodedResult) => {
          console.log("DECODED TEXT : "+decodedText);
          html5QrCode.stop();
		  const resultName = await vaccinatorContract.methods.verifyRegisteredPerson(decodedText.slice(0, 2)).call({from: ethereum.selectedAddress});
		  startScanning.style.visibility='visible';
		  console.log("resultName: " + resultName)
		  if (resultName == "-" || resultName == " "|| resultName == "") {
			alert("FAIL! Not a legit QR code.")
		  } else {
			alert("Legit QR code! Corresponding name: " + resultName)
		  }
        },
        (errorMessage) => {
          // parse error, ignore it.
        })
      .catch((err) => {
        // Start failed, handle it.
      });
}
// *********** /Scanner ************** //
// *********************************** //

var web3 = new Web3(window.ethereum);
const vaccinatorContract = new web3.eth.Contract(ssABI, ssAddress);

const ssSubmit = document.getElementById('ss-input-button');

// REGISTER -> INPUT
ssSubmit.onclick = async () => {
	const ssName = document.getElementById('ss-input-name').value;
	const ssSerialNumber = document.getElementById('ss-input-serial-number').value;
	console.log(ssName + " and serial number: " + ssSerialNumber);
	document.getElementById("qrcode").innerHTML = "";
	subscribeToRegisterEvents();
	await vaccinatorContract.methods.registerVaccinatedPerson(ssName, ssSerialNumber).send({from: ethereum.selectedAddress});
}

// subscribeToRegisterEvents();
var successfulSubscription = vaccinatorContract.events.LogSuccess({})
var unsuccessfulSubscription = vaccinatorContract.events.LogFailure({})
function subscribeToRegisterEvents() {
	// https://betterprogramming.pub/ethereum-dapps-how-to-listen-for-events-c4fa1a67cf81
	successfulSubscription = vaccinatorContract.events.LogSuccess({})
	successfulSubscription
		.on('data', async function(event){
			console.log(event.returnValues);
			qrCode = event.returnValues[0];
			console.log("SUCCESS! WE MANAGED TO LOG")
			console.log("qrCode: " + qrCode)
			var qrc = new QRCode(document.getElementById("qrcode"), qrCode);
			updateSerialNumbersLeft();
			unsubscribeFromRegisterEvents();
			alert("SUCCESS! Please take a screenshot of your QR and present it whenever needed.")
		})
		.on('error', function() {
			console.error
			unsubscribeFromRegisterEvents();
		});
	unsuccessfulSubscription = vaccinatorContract.events.LogFailure({})
	unsuccessfulSubscription
		.on('data', async function(event){
			console.log(event.returnValues);
			console.log("FAIL!")
			unsubscribeFromRegisterEvents();
			alert("FAIL! Your serial number was not legit or already used.");
		})
		.on('error', function() {
			console.error
			unsubscribeFromRegisterEvents();
		})
}

function unsubscribeFromRegisterEvents() {
	successfulSubscription.unsubscribe();
	unsuccessfulSubscription.unsubscribe();
}