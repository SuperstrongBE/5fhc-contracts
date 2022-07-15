import { Blockchain, nameToBigInt, symbolCodeToBigInt,Account } from "@proton/vert";
import { AvailableTemplateDataKey, CollectionName, LoyaltyHWMKey, ShareIndexKey, SplitSharePercentKey } from "./fivefhc.constant";
import { TemplateData } from './generator';
import _ from 'lodash';
import { json } from "stream/consumers";
import { Name,Asset } from "@greymass/eosio";



async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const blockchain = new Blockchain();

  const xTokensContract = blockchain.createContract('xtokens', 'node_modules/proton-tsc/external/xtokens/xtokens', true);
  //console.log (JSON.stringify(xTokensContract.actions));
  const contract = blockchain.createContract('fivefhc', 'target/fivefhc.contract', true);
  const vaultAccount  = blockchain.createContract('fivefhcvault', 'target/fivefhcvault.contract', true);
  const atomicContract = blockchain.createContract('atomicassets', 'node_modules/proton-tsc/external/atomicassets/atomicassets', true);
  const claimerAccount = blockchain.createAccount('remy');
  const userAccount = blockchain.createAccount('johnson');
  

  //#################################################################################################################################
  //Create and issue token 
  await wait(0);

  await xTokensContract.actions.create([contract.name, '5000000000.0000 XPR']).send(`${xTokensContract.name}@active`);
  await xTokensContract.actions.issue([contract.name, '1000000000.0000 XPR', '']).send(`${contract.name}@active`);
  await xTokensContract.actions.transfer([contract.name, userAccount.name.toString(), '500000000.0000 XPR', 'funding']).send(`${contract.name}@active`);
  await xTokensContract.actions.transfer([contract.name, claimerAccount.name.toString(), '500000000.0000 XPR', 'funding']).send(`${contract.name}@active`);


  //#################################################################################################################################
  // Initialize atomicassets
  // atomicassets Create collection
  // atomicassets Create schema
  await wait(0);


  await atomicContract.actions.init().send()
  await atomicContract.actions.admincoledit([
    [
      { "name": "name", "type": "string" },
      { "name": "img", "type": "ipfs" },
      { "name": "description", "type": "string" },
      { "name": "url", "type": "string" },
      { "name": "rlmultiplier", "type": "uint32" },
      { "name": "ogowner", "type": "string" },
      { "name": "tdataid", "type": "uint64" },
      { "name": "birthdate", "type": "string" },
      { "name": "jobtitle", "type": "string" },
      { "name": "company", "type": "string" },
      //TRAITS
      { "name": "skincolor", "type": "string" },
      { "name": "mouth", "type": "string" },
      { "name": "eyes", "type": "string" },
      { "name": "nose", "type": "string" },
      { "name": "clothe", "type": "string" },
      { "name": "apparel", "type": "string" },
      { "name": "texture", "type": "string" },
      { "name": "shape", "type": "string" },
      { "name": "tip", "type": "string" }
    ]
  ]).send()

  await atomicContract.actions.createcol(['fivefhc', CollectionName, true, ['fivefhc'], ['fivefhc'], 0.15, []]).send('fivefhc@active')
  await atomicContract.actions.createschema(['fivefhc', CollectionName, CollectionName, [
    { "name": "name", "type": "string" },
    { "name": "img", "type": "ipfs" },
    { "name": "description", "type": "string" },
    { "name": "url", "type": "string" },
    { "name": "rlmultiplier", "type": "uint32" },
    { "name": "ogowner", "type": "string" },
    { "name": "tdataid", "type": "uint64" },
    { "name": "birthdate", "type": "string" },
    { "name": "jobtitle", "type": "string" },
    { "name": "company", "type": "string" },
    //TRAITS
    { "name": "skincolor", "type": "string" },
    { "name": "mouth", "type": "string" },
    { "name": "eyes", "type": "string" },
    { "name": "nose", "type": "string" },
    { "name": "clothe", "type": "string" },
    { "name": "apparel", "type": "string" },
    { "name": "texture", "type": "string" },
    { "name": "shape", "type": "string" },
    { "name": "tip", "type": "string" }
  ]]).send('fivefhc@active');

  //#################################################################################################################################
  // Core contract calls
  await wait(0);
  await contract.actions.addconf([SplitSharePercentKey, 25]).send('fivefhc@active');
  await contract.actions.addconf([ShareIndexKey, 0]).send('fivefhc@active');
  await contract.actions.addconf([LoyaltyHWMKey, 0]).send('fivefhc@active');
  await contract.actions.addconf([AvailableTemplateDataKey, 0]).send('fivefhc@active');

  
  await wait(0)
  //from:Name, collectionName:string,img:string,firstname:string,lastname:string,birthdate:string,rlmultiplyer:i32,url:string

  for (var i = 0; i < 100; i++) {

    let td = TemplateData();
    
    await contract.actions.addtempldata([td.name, CollectionName, td.immutable, td.mutable]).send('fivefhc@active')
    

  }

  await wait(0);
  

  await wait(0);
  await xTokensContract.actions.transfer([claimerAccount.name.toString(), contract.name.toString(), '275.0000 XPR', '5FHCMINT']).send(`${claimerAccount.name}@active`);
  await xTokensContract.actions.transfer([claimerAccount.name.toString(), contract.name.toString(), '275.0000 XPR', '5FHCMINT']).send(`${claimerAccount.name}@active`);
  await wait(1000);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString(), '275.0000 XPR', '5FHCMINT']).send(`${userAccount.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString(), '275.0000 XPR', '5FHCMINT']).send(`${userAccount.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString(), '275.0000 XPR', '5FHCMINT']).send(`${userAccount.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString(), '275.0000 XPR', '5FHCMINT']).send(`${userAccount.name}@active`);
  
  
  
  //console.log("##Vaulted account is ")
  //console.log(JSON.stringify(account))

  await wait(0);
  await contract.actions.mintasset([claimerAccount.name.toString()]).send('fivefhc@active')  
  await contract.actions.mintasset([claimerAccount.name.toString()]).send('fivefhc@active')  
  await wait(0);
  await contract.actions.mintasset([userAccount.name.toString()]).send('fivefhc@active')  
  await contract.actions.mintasset([userAccount.name.toString()]).send('fivefhc@active')  
  await contract.actions.mintasset([userAccount.name.toString()]).send('fivefhc@active')  
  await contract.actions.mintasset([userAccount.name.toString()]).send('fivefhc@active')

  await wait(1000);
  const accountBefore = getAccount(xTokensContract,vaultAccount.name.toString(),'XPR');
  
  console.log(JSON.stringify(contract.tables.config().getTableRows()))
  console.log(JSON.stringify(contract.tables.allowedaccs().getTableRows()))
  console.log(JSON.stringify(contract.tables.allowedaccs().getTableRows()))
  console.log("##Vaulted account is now")
  console.log(JSON.stringify(accountBefore))
  await wait(1000);
  await wait(1000);
  for(let i:number = 0 ; i<10 ; i++){

    await vaultAccount.actions.claimincome([claimerAccount.name.toString()]).send('fivefhcvault@active')  
  console.log(`##### Final result ${1} #####`)
  const accountAfter = getAccount(xTokensContract,vaultAccount.name.toString(),'XPR');
  console.log(JSON.stringify(contract.tables.config().getTableRows()))
  console.log(JSON.stringify(contract.tables.allowedaccs().getTableRows()))
  console.log(JSON.stringify(contract.tables.allowedaccs().getTableRows()))
  console.log(`##Vaulted account is now after ${i} claims`)
  console.log(JSON.stringify(accountAfter))

  }
  await vaultAccount.actions.claimincome([claimerAccount.name.toString()]).send('fivefhcvault@active')  
  console.log('##### Final result #####')
  const accountAfter = getAccount(xTokensContract,vaultAccount.name.toString(),'XPR');
  console.log(JSON.stringify(contract.tables.config().getTableRows()))
  console.log(JSON.stringify(contract.tables.allowedaccs().getTableRows()))
  console.log(JSON.stringify(contract.tables.allowedaccs().getTableRows()))
  console.log("##Vaulted account is now")
  console.log(JSON.stringify(accountAfter))
}

const getAccount = (contract: Account, accountName: string, symcode: string) => {
  const accountBigInt = nameToBigInt(Name.from(accountName));
  const symcodeBigInt = symbolCodeToBigInt(Asset.SymbolCode.from(symcode));
  return contract.tables.accounts(accountBigInt).getTableRow(symcodeBigInt)
}

main()
