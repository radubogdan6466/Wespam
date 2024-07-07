// web3Utils.js
import Web3 from "web3";

export const ConnectWallet = async () => {
  if (window.ethereum) {
    const web3 = new Web3(window.ethereum);
    try {
      // Folosim metoda recomandată eth_requestAccounts
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      return accounts[0]; // Returnează primul cont din MetaMask
    } catch (error) {
      console.error("User denied account access");
      throw error; // Aruncă eroarea în caz de refuz
    }
  } else {
    throw new Error("MetaMask not found"); // Aruncă o eroare dacă nu e găsit MetaMask
  }
};
