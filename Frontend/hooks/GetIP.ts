// GetIP.ts
import * as Network from 'expo-network';

let ipAddress: string = '';

// Fetch the local IP address using expo-network.
Network.getIpAddressAsync()
  .then((ip) => {
    ipAddress = ip ?? '';
    console.log('Fetched local IPv4 address:', ipAddress);
  })
  .catch((error) => {
    console.error('Error fetching local IP:', error);
  });

export { ipAddress };



// GetIP.ts
// let ipAddress: string = '';

// // Immediately fetch the public IP address when this module is imported.
// fetch('https://api64.ipify.org?format=json')
//   .then(response => response.json())
//   .then((data: { ip: string }) => {
//     ipAddress = data.ip;
//     console.log("Fetched IP address:", ipAddress);
//   })
//   .catch(error => {
//     console.error("Error fetching public IP:", error);
//   });

// // Export the variable (it will be updated once the fetch resolves)
// export { ipAddress };
