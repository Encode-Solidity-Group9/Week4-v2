import { Component } from '@angular/core';
import { ethers } from 'ethers';
import tokenJson from '../assets/MyToken.json'
import { HttpClient } from '@angular/common/http';

// const TOKENIZED_VOTES_ADDRESS = "0xF9de83d41e68d3a15b98Cf3d4656eaf4CF3Aac8B";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  
  provider: ethers.providers.Provider;
  tokenAddress: string | undefined;
  wallet: ethers.Wallet | undefined;
  tokenContract: ethers.Contract | undefined;

  etherBalance: number | undefined;
  tokenBalance: number | undefined;
  votePower: number | undefined;
  

  constructor(private http: HttpClient) {
    // this.wallet = new ethers.Wallet('0x0123456789012345678901234567890123456789012345678901234567890123');
    this.provider = ethers.getDefaultProvider('sepolia');
    
    

  }

  createWallet() {

    this.http.get<any>('http://localhost:3000/token-address').subscribe((data) => {
      this.tokenAddress = data.result;
      if (this.tokenAddress) {

        this.wallet = ethers.Wallet.createRandom().connect(this.provider);
        this.tokenContract = new ethers.Contract(this.tokenAddress, tokenJson.abi, this.wallet);
        this.updateInfo();
      }
    });
    

  }

  private updateInfo() {
    this.wallet.getBalance().then((balanceBN: ethers.BigNumberish) => {
      this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBN));
    });
    this.tokenContract["balanceOf"](this.wallet.address).then((balanceBN: ethers.BigNumberish) => {
      this.tokenBalance = parseFloat(ethers.utils.formatEther(balanceBN));
    });
    this.tokenContract["getVotes"](this.wallet.address).then((votesBN: ethers.BigNumberish) => {
      this.votePower = parseFloat(ethers.utils.formatEther(votesBN));
    });
  }

  importWallet(privatekey: string) {
    this.wallet = new ethers.Wallet(privatekey);
  }

  claimTokens() {
    this.http.post<any>('http://localhost:3000/claim-tokens', {
      "address": this.wallet?.address
    }).subscribe((data) => {
      const txHash = data.result;
      this.provider.getTransaction(txHash).then((tx) => {
        tx.wait().then((receipt) => {
          // TODO: optional display
          // reload info by calling the 
        });
      console.log(data);
    });
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
