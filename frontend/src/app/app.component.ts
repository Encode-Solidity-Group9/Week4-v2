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
  claimInitialized: boolean = false;

  delegated = false;
  delegateAddress: string = "";
  

  constructor(private http: HttpClient) {
    // this.wallet = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
    this.network = "sepolia";    
    this.http.get<any>('http://localhost:3000/token-address').subscribe((data) => {
      this.tokenAddress = data.result;
      console.log("token address: " + this.tokenAddress);
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



  async connectWallet(){
    // window.ethereum.setNetwork(12);
    
    if (window.ethereum) {
      this.providerWeb3 = new ethers.providers.Web3Provider(window.ethereum, "any");
        try {
          window.ethereum.enable().then(() => {
            // MetaMask is now enabled
            console.log("metamask is enabled");
          });
        } catch (error) {
          // MetaMask was rejected by the user
          console.log("metamask was rejected");
        }
        this.providerWeb3.getNetwork().then((network) => {
          console.log("Network:" + network.name);
          if (network.name != this.network){
            this.switchNetwork();
          }
        });
    
        this.signer = this.providerWeb3.getSigner();
        this.signer.getAddress().then((address) => {
          this.walletAddress = address;
          console.log("connected to wallet: " + address);
          this.updateInfo();
        });
        if (this.tokenAddress) {
          this.tokenContract = new ethers.Contract(this.tokenAddress, tokenJson.abi, this.signer);
        }
      } 
    else {
        // MetaMask is not available
        console.log("metamask is not available");
    }
    // this.updateInfo();
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
      console.log("error switching network");
    }
  }

  updateInfo() {
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
    else if (this.signer) {
      this.signer.getBalance().then((balanceBN: ethers.BigNumberish) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN));
      });
      if (this.tokenContract){
        this.tokenContract["balanceOf"](this.walletAddress).then((balanceBN: ethers.BigNumberish) => {
          this.tokenBalance = parseFloat(ethers.utils.formatEther(balanceBN));
        });
        this.tokenContract["getVotes"](this.walletAddress).then((votesBN: ethers.BigNumberish) => {
          this.votePower = parseFloat(ethers.utils.formatEther(votesBN));
        });
      }
    }
  }

  importWallet(privatekey: string) {
    this.wallet = new ethers.Wallet(privatekey);
  }

  claimTokens() {
    if (this.walletAddress) {
      console.error("requesting tokens for " + this.walletAddress);

      this.claimInitialized = true;
      this.http.post<any>('http://localhost:3000/claim-tokens', {
        "address": this.walletAddress
      }).subscribe((data) => {
        const txHash = data.result;
        if (this.provider){
          this.provider.getTransaction(txHash).then((tx) => {
            tx.wait().then((receipt) => {
              // TODO: optional display
              // reload info by calling the 
              this.updateInfo();
            });
          console.log(data);
          });
        }
      });
    }
    else {
      // console.log("no wallet connected");
      console.error("no wallet connected");
    }
  }

  connectBallot(address: string) {
  }

  async delegate(delegateTo: string) {
    if (this.tokenContract) {
      let tx = await this.tokenContract["delegate"](delegateTo);
      console.log(`\nTransaction Hash: ${tx.hash}`);
      await tx.wait();
      this.delegated = true;
      this.delegateAddress = delegateTo;
      this.updateInfo();
    }
  }

  castVote() {
  }

  getBallotInfo() {
  }
}

