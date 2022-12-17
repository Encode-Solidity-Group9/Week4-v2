import { Component } from '@angular/core';
import { ethers } from 'ethers';
import tokenJson from '../assets/MyToken.json'
import { HttpClient } from '@angular/common/http';
import Web3 from 'web3';

// const TOKENIZED_VOTES_ADDRESS = "0xF9de83d41e68d3a15b98Cf3d4656eaf4CF3Aac8B";
declare let window: any;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  provider: ethers.providers.Provider | undefined;
  providerWeb3 : ethers.providers.Web3Provider | undefined;
  tokenAddress: string | undefined;
  wallet: ethers.Wallet | undefined;
  signer: ethers.providers.JsonRpcSigner | undefined;
  web3: Web3 | undefined;
  walletAddress: string | undefined;

  tokenContract: ethers.Contract | undefined;
  network: string;

  etherBalance: number | undefined;
  tokenBalance: number | undefined;
  votePower: number | undefined;

  
  

  constructor(private http: HttpClient) {
    // this.wallet = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
    this.network = "sepolia";    
    this.http.get<any>('http://localhost:3000/token-address').subscribe((data) => {
      this.tokenAddress = data.result;
    });
    
  }

  createWallet() {
    if (this.tokenAddress) {
      this.provider = ethers.getDefaultProvider(this.network);
      this.wallet = ethers.Wallet.createRandom().connect(this.provider);
      this.walletAddress = this.wallet.address;
      this.tokenContract = new ethers.Contract(this.tokenAddress, tokenJson.abi, this.wallet);
      this.updateInfo();
    }
  }

  // connectWallet() {
  //   if (window.ethereum) {
  //     this.web3 = new Web3(window.ethereum);
  //     try {
  //       window.ethereum.enable().then(() => {
  //         // MetaMask is now enabled
  //         console.log("metamask is enabled");
  //       });
  //     } catch (error) {
  //       // MetaMask was rejected by the user
  //       console.log("metamask was rejected");
  //     }
  //   } else if (window.web3) {
  //     this.web3 = new Web3(window.web3.currentProvider);
  //     console.log("window web3");
  //   } else {
  //     // MetaMask is not available
  //     console.log("metamask is not available");
  //   }
  //   console.log(this.web3?.currentProvider);
  //   if (this.web3){
  //     this.web3.eth.getAccounts((error, accounts) => {
  //       if (error) {
  //         console.error(error);
  //       } else {
  //         this.walletAddress = accounts[0];
  //         console.log(`Account is ${accounts[0]}`);  // Array of Ethereum addresses
  //       }
  //     });
  //   }
  // }

  async connectWallet(){
    // window.ethereum.setNetwork(12);
    this.providerWeb3 = new ethers.providers.Web3Provider(window.ethereum, "any");
    this.providerWeb3.getNetwork().then((network) => {
      console.log("Network:" + network.name);
      if (network.name != "sepolia"){
        this.switchNetwork();
      }
    });

    this.signer = this.providerWeb3.getSigner();
    this.signer.getAddress().then((address) => {
      this.walletAddress = address;
      console.log("connected to wallet: " + address);
    });
    if (this.tokenAddress) {
      this.tokenContract = new ethers.Contract(this.tokenAddress, tokenJson.abi, this.signer);
    }
    
  }
  

  private switchNetwork(){
    try {
      window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xAA36A7' }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0xAA36A7",
                rpcUrls: ["https://sepolia.infura.io/v3/"],
                chainName: "Sepolia",
                nativeCurrency: {
                    name: "SEP",
                    symbol: "SEP",
                    decimals: 18
                },
                blockExplorerUrls: ["https://sepolia.etherscan.io/"]
            }]
           });}
        catch (addError) {
          // handle "add" error
          console.log("error adding network");
          console.log("Error:" + addError);
        }
      }
    }
  }

  private updateInfo() {
    if (this.wallet){
      this.wallet.getBalance().then((balanceBN: ethers.BigNumberish) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN));
      });
      if (this.tokenContract){
        this.tokenContract["balanceOf"](this.wallet.address).then((balanceBN: ethers.BigNumberish) => {
          this.tokenBalance = parseFloat(ethers.utils.formatEther(balanceBN));
        });
        this.tokenContract["getVotes"](this.wallet.address).then((votesBN: ethers.BigNumberish) => {
          this.votePower = parseFloat(ethers.utils.formatEther(votesBN));
        });
      }
    }
  }

  importWallet(privatekey: string) {
    this.wallet = new ethers.Wallet(privatekey);
  }

  claimTokens() {
    this.http.post<any>('http://localhost:3000/claim-tokens', {
      "address": this.wallet?.address
    }).subscribe((data) => {
      const txHash = data.result;
      if (this.provider){
        this.provider.getTransaction(txHash).then((tx) => {
          tx.wait().then((receipt) => {
            // TODO: optional display
            // reload info by calling the 
          });
        console.log(data);
        });
      }
    });
  }

  connectBallot(address: string) {
  }

  delegate() {
  }

  castVote() {
  }

  getBallotInfo() {
  }
}
