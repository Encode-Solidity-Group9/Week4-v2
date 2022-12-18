import { Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions';
import { ethers } from 'ethers';
import * as tokenJson from './assets/MyToken.json'
import { ConfigService } from '@nestjs/config';


const TOKENIZED_VOTES_ADDRESS = "0xBDABC9564886E68D3d57faec9B2E8C53F12F612F";
const BALLOT_ADDRESS = null;

@Injectable()
export class AppService {
  provider: ethers.providers.BaseProvider;

  constructor(private configService: ConfigService) {
    this.provider = ethers.getDefaultProvider("sepolia");
  }

  async claimTokens(address: string) {
    // TODO: Build the contract object
    // TODO: pick the signer using the .env keys
    // TODO: connect the contract object to the signer
    // TODO: make the transaction to mint the tokens
    // TODO: await the transaction get the receipt return the has
    // TODO: 
    // TODO: 
    const privateKey = this.configService.get<string>('PRIVATE_KEY');

    const wallet = new ethers.Wallet(privateKey);
    const signer = wallet.connect(this.provider);
    const tokenContract = new ethers.Contract(TOKENIZED_VOTES_ADDRESS, tokenJson.abi, signer);
    const mintAmount = ethers.utils.parseEther("10");
    let tx = await tokenContract.mint(address, mintAmount);

    // let tx = await tokenContract.mint(addressTo, TOKEN_MINT_VALUE);
    
    await tx.wait();
    console.log(`\nTransaction Hash: ${tx.hash}`);
    return {result: tx.hash};
    // return {result: `Claiming tokens for ${address}. Transaction Hash: ${tx.hash}`};
  }

  async getTokenAddress() {
    return {result: TOKENIZED_VOTES_ADDRESS};
  }

  async getBallotAddress() {
    return {result: BALLOT_ADDRESS};
  }

  async getBallotChoices() {
  }

}
