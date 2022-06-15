import { Blockchain } from "@proton/vert";
import { CollectionName, LoyaltyHWMKey, ShareIndexKey, SplitSharePercentKey } from "./fivefhc.constant";


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
  const atomicContract = blockchain.createContract('atomicassets', 'node_modules/proton-tsc/external/atomicassets/atomicassets', true);
  const userAccount = blockchain.createAccount('johnson');
  
  //#################################################################################################################################
  //Create and issue token 
  await wait(0);
  
  await xTokensContract.actions.create([contract.name, '5000000000 XPR']).send(`${xTokensContract.name}@active`);
  await xTokensContract.actions.issue([contract.name, '1000000000 XPR', '']).send(`${contract.name}@active`);
  await xTokensContract.actions.transfer([contract.name,userAccount.name.toString(), '1000000000 XPR', 'funding']).send(`${contract.name}@active`);
  

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
      { "name": "rlmultiplyer", "type": "uint32" },
      { "name": "ogowner", "type": "string" },
      { "name": "birthdate", "type": "string" }
    ]
  ]).send()

  await atomicContract.actions.createcol(['fivefhc', CollectionName, true, ['fivefhc'], ['fivefhc'], 0.15, []]).send('fivefhc@active')
  await atomicContract.actions.createschema(['fivefhc', CollectionName, CollectionName, [
    { "name": "name", "type": "string" },
    { "name": "img", "type": "ipfs" },
    { "name": "description", "type": "string" },
    { "name": "url", "type": "string" },
    { "name": "rlmultiplyer", "type": "int32" },
    { "name": "ogowner", "type": "string" },
    { "name": "birthdate", "type": "string" }

  ]]).send('fivefhc@active');

  //#################################################################################################################################
  // Core contract calls
  await wait(0);
  await contract.actions.updateconf([SplitSharePercentKey,0.35]).send('fivefhc@active')
  await contract.actions.updateconf([ShareIndexKey,0]).send('fivefhc@active')
  await contract.actions.updateconf([LoyaltyHWMKey,0]).send('fivefhc@active')
  
  await wait(0);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString() ,'270 XPR', '5FHCMINT;654654654201;7;Huge Deware;ds654v4v654svd54b54456b44rrtb6645ev']).send(`${userAccount.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString() ,'270 XPR', '5FHCMINT;654654654201;2;Anton Figeroa;ds654v4v654svd54b54456b44rrtb6645ev']).send(`${userAccount.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString() ,'270 XPR', '5FHCMINT;654654654201;5;Mat Bright;ds654v4v654svd54b54456b44rrtb6645ev']).send(`${userAccount.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString() ,'270 XPR', '5FHCMINT;654654654201;3;Frank Silverstein;ds654v4v654svd54b54456b44rrtb6645ev']).send(`${userAccount.name}@active`);

  await wait(0);
  //from:Name, collectionName:string,img:string,firstname:string,lastname:string,birthdate:string,rlmultiplyer:i32,url:string
  await contract.actions.createtempl([userAccount.name.toString(),CollectionName,"sdf654646ezr65z6r5z65sd6f5s",'Michel','Sebastian','01/06/2013','5fhc.com',"dickehead"]).send('fivefhc@active')
  await contract.actions.mintasset([userAccount.name.toString(),CollectionName,7]).send('fivefhc@active')
  
  await contract.actions.createtempl([userAccount.name.toString(),CollectionName,"sdfsdfsdgdsgdfgd",'Chrsitphe','Chmigo','01/06/2013','5fhc.com',"dickehead"]).send('fivefhc@active')
  await contract.actions.mintasset([userAccount.name.toString(),CollectionName,7]).send('fivefhc@active')
}

main()
